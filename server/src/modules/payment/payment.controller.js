const axios = require('axios');
const Order = require('./order.model');
const Course = require('../course/course.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const Notification = require('../notification/notification.model');

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_API_VERSION = '2025-01-01';

const isProdEnvironment = process.env.CASHFREE_ENVIRONMENT === 'production' || 
                          (CASHFREE_CLIENT_SECRET && CASHFREE_CLIENT_SECRET.includes('prod')) ||
                          process.env.NODE_ENV === 'production';

const CASHFREE_BASE_URL = isProdEnvironment 
  ? 'https://api.cashfree.com/pg/orders' 
  : 'https://sandbox.cashfree.com/pg/orders';

exports.createOrder = catchAsync(async (req, res, next) => {
  const { courseId } = req.body;
  const user = req.user;

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check if course is free
  if (course.price === 0) {
    // If free, just enroll the student
    await Course.findByIdAndUpdate(courseId, { 
      $addToSet: { enrolledStudents: user._id } 
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Successfully enrolled in free course',
      isFree: true
    });
  }

  // Create internal order record
  const orderId = `order_${Date.now()}_${user._id.toString().slice(-4)}`;
  
  try {
    const response = await axios.post(
      CASHFREE_BASE_URL,
      {
        order_id: orderId,
        order_amount: course.price,
        order_currency: 'INR',
        customer_details: {
          customer_id: user._id.toString(),
          customer_email: user.email,
          customer_phone: user.phone || '9999999999', // Fallback if phone not available
          customer_name: user.name
        },
        order_meta: {
          return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/course/${courseId}/payment-verify?order_id={order_id}`,
          notify_url: `${process.env.BACKEND_URL}/api/v1/payment/webhook`
        }
      },
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'x-api-version': CASHFREE_API_VERSION,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save order in our DB
    await Order.create({
      orderId: orderId,
      user: user._id,
      course: courseId,
      amount: course.price,
      paymentSessionId: response.data.payment_session_id,
      cfOrderId: response.data.cf_order_id,
      status: 'PENDING'
    });

    res.status(200).json({
      status: 'success',
      data: response.data,
      environment: isProdEnvironment ? 'production' : 'sandbox'
    });

  } catch (err) {
    console.error('Cashfree Create Order Error:', err.response?.data || err.message);
    return next(new AppError(err.response?.data?.message || 'Error creating payment order', 500));
  }
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findOne({ orderId }).populate('course user');
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // If already paid, return success
  if (order.status === 'PAID') {
    return res.status(200).json({
      status: 'success',
      message: 'Payment already verified',
      data: { order }
    });
  }

  try {
    const response = await axios.get(
      `${CASHFREE_BASE_URL}/${orderId}`,
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'x-api-version': CASHFREE_API_VERSION
        }
      }
    );

    const cfOrder = response.data;

    if (cfOrder.order_status === 'PAID') {
      // Update our order status
      order.status = 'PAID';
      order.paymentDetails = cfOrder;
      await order.save();

      // Enroll student in course
      await Course.findByIdAndUpdate(order.course, {
        $addToSet: { enrolledStudents: order.user }
      });

      // Notify student
      try {
        await Notification.create({
          userId: order.user,
          title: 'Payment Successful! 💰',
          message: `Your payment for ${order.course.title} was successful. You are now enrolled!`,
          type: 'COURSE_UPDATE'
        });
      } catch (nErr) {}

      res.status(200).json({
        status: 'success',
        message: 'Payment successful',
        data: { order }
      });
    } else {
      res.status(200).json({
        status: 'failed',
        message: `Payment status: ${cfOrder.order_status}`,
        data: { order_status: cfOrder.order_status }
      });
    }

  } catch (err) {
    console.error('Cashfree Verify Order Error:', err.response?.data || err.message);
    return next(new AppError('Error verifying payment', 500));
  }
});

exports.handleWebhook = catchAsync(async (req, res, next) => {
  const { data } = req.body;
  const cfOrderId = data.order.order_id;
  const cfOrderStatus = data.order.order_status;

  console.log(`Webhook received for Order ID: ${cfOrderId}, Status: ${cfOrderStatus}`);

  if (cfOrderStatus === 'PAID') {
    const order = await Order.findOne({ orderId: cfOrderId });
    if (order && order.status !== 'PAID') {
      order.status = 'PAID';
      order.paymentDetails = data;
      await order.save();

      // Enroll user
      await Course.findByIdAndUpdate(order.course, {
        $addToSet: { enrolledStudents: order.user }
      });

      // Notify student
      try {
        await Notification.create({
          userId: order.user,
          title: 'Payment Confirmed! ✅',
          message: `We received your payment confirmation. Start learning now!`,
          type: 'COURSE_UPDATE'
        });
      } catch (nErr) {}
    }
  }

  // Cashfree expects a 200 response for webhooks
  res.status(200).json({ status: 'received' });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find()
    .populate('user', 'name email avatar')
    .populate('course', 'title price')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders }
  });
});

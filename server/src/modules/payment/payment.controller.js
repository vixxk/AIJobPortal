const axios = require('axios');
const Order = require('./order.model');
const Course = require('../course/course.model');
const User = require('../user/user.model');
const SubscriptionPlanConfig = require('./subscriptionPlanConfig.model');
const PayPerUseConfig = require('./payPerUseConfig.model');
const subscriptionHelper = require('../../utils/subscriptionHelper');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const Notification = require('../notification/notification.model');

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_API_VERSION = '2023-08-01';

const isProdEnvironment = process.env.CASHFREE_ENVIRONMENT === 'production' || 
                          (CASHFREE_CLIENT_SECRET && CASHFREE_CLIENT_SECRET.includes('prod')) ||
                          process.env.NODE_ENV === 'production';

const CASHFREE_BASE_URL = isProdEnvironment 
  ? 'https://api.cashfree.com/pg/orders' 
  : 'https://sandbox.cashfree.com/pg/orders';

// Seed plan configs if not present
const seedPlanConfigs = async () => {
  try {
    const count = await SubscriptionPlanConfig.countDocuments();
    if (count === 0) {
      await SubscriptionPlanConfig.create([
        {
          planKey: 'FREE',
          name: 'Free',
          price: 0,
          offerings: [
            '30 Spoken English Sessions/month',
            '1 Resume Download/month',
            '1 Mock Interview/week',
            'Job Application Tracking',
            'Basic Profile Builder',
            'Basic AI feedback'
          ],
          spokenEnglishLimit: 30,
          resumesLimit: 1,
          interviewsLimit: 1
        },
        {
          planKey: 'PRO',
          name: 'Pro',
          price: 99,
          offerings: [
            '100 Spoken English Sessions/month',
            '10 Resume Downloads/month',
            '30 Mock Interviews/month',
            'Advanced Job Search Agent',
            'Verified Profile Badge',
            'Advanced AI feedback',
            'Priority Support'
          ],
          spokenEnglishLimit: 100,
          resumesLimit: 10,
          interviewsLimit: 30
        },
        {
          planKey: 'PRO_PLUS',
          name: 'Pro Plus',
          price: 149,
          offerings: [
            '150 Spoken English Sessions/month',
            '20 Resume Downloads/month',
            '50 Mock Interviews/month',
            'Premium Placement Pool',
            'Direct Recruiter Messaging',
            'Premium AI tutor',
            'Dedicated support'
          ],
          spokenEnglishLimit: 150,
          resumesLimit: 20,
          interviewsLimit: 50
        }
      ]);
      console.log('[Seed] Default subscription plans seeded successfully.');
    } else {
      // Update existing plans to use job portal benefits instead of resume rewrites
      await SubscriptionPlanConfig.updateOne(
        { planKey: 'FREE' },
        { 
          $set: { 
            offerings: [
              '30 Spoken English Sessions/month',
              '1 Resume Download/month',
              '1 Mock Interview/week',
              'Job Application Tracking',
              'Basic Profile Builder',
              'Basic AI feedback'
            ],
            spokenEnglishLimit: 30,
            interviewsLimit: 1
          }
        }
      );
      await SubscriptionPlanConfig.updateOne(
        { planKey: 'PRO' },
        { 
          $set: { 
            offerings: [
              '100 Spoken English Sessions/month',
              '10 Resume Downloads/month',
              '30 Mock Interviews/month',
              'Advanced Job Search Agent',
              'Verified Profile Badge',
              'Advanced AI feedback',
              'Priority Support'
            ]
          }
        }
      );
      await SubscriptionPlanConfig.updateOne(
        { planKey: 'PRO_PLUS' },
        { 
          $set: { 
            offerings: [
              '150 Spoken English Sessions/month',
              '20 Resume Downloads/month',
              '50 Mock Interviews/month',
              'Premium Placement Pool',
              'Direct Recruiter Messaging',
              'Premium AI tutor',
              'Dedicated support'
            ]
          }
        }
      );
    }
  } catch (err) {
    console.error('Error seeding/updating plan configs:', err.message);
  }
};
setTimeout(seedPlanConfigs, 2000);

// Helper helper function to update subscription state in DB on payment success
const fulfillOrder = async (order, cfOrderDetails) => {
  if (order.orderType === 'COURSE') {
    await Course.findByIdAndUpdate(order.course, {
      $addToSet: { enrolledStudents: order.user }
    });
    // Notify user of course purchase
    try {
      const course = await Course.findById(order.course);
      const courseTitle = course ? course.title : 'Course';
      await Notification.create({
        userId: order.user,
        title: 'Course Purchased! 📚',
        message: `Successfully enrolled in "${courseTitle}". You can now access all lectures.`,
        type: 'PAYMENT_SUCCESS'
      });
    } catch (nErr) {
      console.error('Failed to create course purchase notification:', nErr);
    }
  } else if (order.orderType === 'PAY_PER_USE') {
    const user = await User.findById(order.user);
    if (user) {
      let featureName = '';
      if (order.payPerUseType === 'INTERVIEW') {
        user.usageLimits.interviews.limit += 1;
        featureName = 'Mock Interview session';
      } else if (order.payPerUseType === 'RESUME') {
        user.usageLimits.resumes.limit += 1;
        featureName = 'Resume Download';
      } else if (order.payPerUseType === 'ENGLISH_TUTOR') {
        user.usageLimits.spokenEnglish.limit += 1;
        featureName = 'Spoken English session';
      }
      await user.save();

      // Notify user of pay-per-use purchase success
      try {
        await Notification.create({
          userId: user._id,
          title: 'Payment Successful! 💳',
          message: `Successfully purchased 1 ${featureName || 'pay-per-use item'}. Your limit has been updated.`,
          type: 'PAYMENT_SUCCESS'
        });
      } catch (nErr) {
        console.error('Failed to create pay-per-use notification:', nErr);
      }
    }
  } else if (order.orderType === 'SUBSCRIPTION') {
    const user = await User.findById(order.user);
    if (user) {
      const limits = await subscriptionHelper.getPlanLimits(order.subscriptionPlanKey);
      user.subscription.plan = order.subscriptionPlanKey;
      user.subscription.status = 'ACTIVE';
      user.subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      user.usageLimits.spokenEnglish.limit = limits.spokenEnglish;
      user.usageLimits.resumes.limit = limits.resumes;
      user.usageLimits.resumesRewrites.limit = limits.resumesRewrites;
      user.usageLimits.interviews.limit = limits.interviews;
      
      user.usageLimits.spokenEnglish.used = 0;
      user.usageLimits.resumes.used = 0;
      user.usageLimits.resumesRewrites.used = 0;
      user.usageLimits.interviews.used = 0;
      user.usageLimits.lastResetDate = new Date();
      await user.save();

      // Notify user
      try {
        await Notification.create({
          userId: user._id,
          title: 'Subscription Activated! 🎉',
          message: `Welcome to the ${order.subscriptionPlanKey} plan. Your limits have been updated!`,
          type: 'SYSTEM_UPDATE'
        });
      } catch (nErr) {}
    }
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ status: 'error', message: 'No course found with that ID' });
    }

    if (course.price === 0) {
      await Course.findByIdAndUpdate(courseId, { 
        $addToSet: { enrolledStudents: user._id } 
      });
      return res.status(200).json({
        status: 'success',
        message: 'Successfully enrolled in free course',
        isFree: true
      });
    }

    const isAlreadyEnrolled = course.enrolledStudents?.some(
      s => (s?._id || s)?.toString() === user._id.toString()
    );
    if (isAlreadyEnrolled) {
      return res.status(200).json({
        status: 'success',
        message: 'You are already enrolled in this course',
        isFree: true
      });
    }

    const orderId = `order_${Date.now()}_${user._id.toString().slice(-4)}`;
    const clientOrigin = req.headers.origin || process.env.CLIENT_URL || 'https://user.hyrego.com';
    const returnUrl = `${clientOrigin.replace(/\/$/, '')}/app/learning/course/${courseId}/payment-verify?order_id={order_id}`;
    const notifyUrl = `${(process.env.BACKEND_URL || 'https://app.hyrego.com').replace(/\/$/, '')}/api/v1/payment/webhook`;

    const orderPayload = {
      order_id: orderId,
      order_amount: Number(course.price),
      order_currency: 'INR',
      customer_details: {
        customer_id: user._id.toString(),
        customer_email: user.email,
        customer_phone: user.phone || '9999999999',
        customer_name: user.name || 'Student'
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: notifyUrl
      }
    };

    const response = await axios.post(
      CASHFREE_BASE_URL,
      orderPayload,
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'x-api-version': CASHFREE_API_VERSION,
          'Content-Type': 'application/json'
        }
      }
    );

    await Order.create({
      orderId: orderId,
      user: user._id,
      course: courseId,
      amount: course.price,
      paymentSessionId: response.data.payment_session_id,
      cfOrderId: response.data.cf_order_id,
      orderType: 'COURSE',
      status: 'PENDING'
    });

    res.status(200).json({
      status: 'success',
      data: response.data,
      environment: isProdEnvironment ? 'production' : 'sandbox'
    });

  } catch (err) {
    console.error('Cashfree Create Order Error:', err.response?.data || err.message);
    const cfErrorMsg = err.response?.data?.message || err.response?.data || err.message;
    return res.status(500).json({
      status: 'error',
      message: `Payment Error: ${typeof cfErrorMsg === 'object' ? JSON.stringify(cfErrorMsg) : cfErrorMsg}`
    });
  }
};

exports.createPayPerUseOrder = catchAsync(async (req, res, next) => {
  const { featureType } = req.body;
  const user = req.user;

  const validFeatures = ['INTERVIEW', 'RESUME', 'ENGLISH_TUTOR'];
  if (!validFeatures.includes(featureType)) {
    return next(new AppError('Invalid feature type for pay-per-use', 400));
  }

  const amount = await subscriptionHelper.getPayPerUsePrice(featureType);
  const orderId = `pay_${featureType.toLowerCase()}_${Date.now()}_${user._id.toString().slice(-4)}`;
  const clientOrigin = req.headers.origin || process.env.CLIENT_URL || 'https://user.hyrego.com';
  const returnUrl = `${clientOrigin.replace(/\/$/, '')}/app/payment-verify?order_id={order_id}`;
  const notifyUrl = `${(process.env.BACKEND_URL || 'https://app.hyrego.com').replace(/\/$/, '')}/api/v1/payment/webhook`;

  const orderPayload = {
    order_id: orderId,
    order_amount: Number(amount),
    order_currency: 'INR',
    customer_details: {
      customer_id: user._id.toString(),
      customer_email: user.email,
      customer_phone: user.phone || '9999999999',
      customer_name: user.name || 'Student'
    },
    order_meta: {
      return_url: returnUrl,
      notify_url: notifyUrl
    }
  };

  try {
    const response = await axios.post(
      CASHFREE_BASE_URL,
      orderPayload,
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'x-api-version': CASHFREE_API_VERSION,
          'Content-Type': 'application/json'
        }
      }
    );

    await Order.create({
      orderId: orderId,
      user: user._id,
      amount,
      paymentSessionId: response.data.payment_session_id,
      cfOrderId: response.data.cf_order_id,
      orderType: 'PAY_PER_USE',
      payPerUseType: featureType,
      status: 'PENDING'
    });

    res.status(200).json({
      status: 'success',
      data: response.data
    });
  } catch (err) {
    console.error('Cashfree Create Pay-Per-Use Order Error:', err.response?.data || err.message);
    const cfErrorMsg = err.response?.data?.message || err.response?.data || err.message;
    return next(new AppError(`Payment Error: ${typeof cfErrorMsg === 'object' ? JSON.stringify(cfErrorMsg) : cfErrorMsg}`, 500));
  }
});

exports.createSubscriptionOrder = catchAsync(async (req, res, next) => {
  const { planKey } = req.body;
  const user = req.user;

  if (!['PRO', 'PRO_PLUS'].includes(planKey)) {
    return next(new AppError('Invalid subscription plan key', 400));
  }

  if (user.subscription?.plan === 'PRO_PLUS' && planKey === 'PRO') {
    return next(new AppError('You are already subscribed to PRO PLUS. Downgrades are disabled.', 400));
  }

  const planConfig = await SubscriptionPlanConfig.findOne({ planKey });
  if (!planConfig) {
    return next(new AppError('Subscription plan configuration not found', 404));
  }

  const orderId = `sub_${planKey.toLowerCase()}_${Date.now()}_${user._id.toString().slice(-4)}`;
  const clientOrigin = req.headers.origin || process.env.CLIENT_URL || 'https://user.hyrego.com';
  const returnUrl = `${clientOrigin.replace(/\/$/, '')}/app/payment-verify?order_id={order_id}`;
  const notifyUrl = `${(process.env.BACKEND_URL || 'https://app.hyrego.com').replace(/\/$/, '')}/api/v1/payment/webhook`;

  const orderPayload = {
    order_id: orderId,
    order_amount: Number(planConfig.price),
    order_currency: 'INR',
    customer_details: {
      customer_id: user._id.toString(),
      customer_email: user.email,
      customer_phone: user.phone || '9999999999',
      customer_name: user.name || 'Student'
    },
    order_meta: {
      return_url: returnUrl,
      notify_url: notifyUrl
    }
  };

  try {
    const response = await axios.post(
      CASHFREE_BASE_URL,
      orderPayload,
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'x-api-version': CASHFREE_API_VERSION,
          'Content-Type': 'application/json'
        }
      }
    );

    await Order.create({
      orderId: orderId,
      user: user._id,
      amount: planConfig.price,
      paymentSessionId: response.data.payment_session_id,
      cfOrderId: response.data.cf_order_id,
      orderType: 'SUBSCRIPTION',
      subscriptionPlanKey: planKey,
      status: 'PENDING'
    });

    res.status(200).json({
      status: 'success',
      data: response.data
    });
  } catch (err) {
    console.error('Cashfree Create Subscription Order Error:', err.response?.data || err.message);
    const cfErrorMsg = err.response?.data?.message || err.response?.data || err.message;
    return next(new AppError(`Payment Error: ${typeof cfErrorMsg === 'object' ? JSON.stringify(cfErrorMsg) : cfErrorMsg}`, 500));
  }
});

exports.getSubscriptionStatus = catchAsync(async (req, res, next) => {
  let user = req.user;
  if (user.role === 'STUDENT') {
    user = await subscriptionHelper.checkAndResetLimits(user);
  }

  // Clone usageLimits to avoid modifying DB representation directly
  const usageLimits = JSON.parse(JSON.stringify(user.usageLimits || {}));

  // Fetch plan config from DB to get latest customized limits
  const planLimits = await subscriptionHelper.getPlanLimits(user.subscription.plan || 'FREE');

  if (user.subscription.plan === 'FREE') {
    // 1. Spoken English monthly limit (from DB customizations)
    usageLimits.spokenEnglish.limit = planLimits.spokenEnglish || 30;

    // 2. Mock interviews weekly limit check & correct display
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentInterviews = (user.usageLimits.interviews.dates || [])
      .map(d => new Date(d))
      .filter(d => d >= oneWeekAgo);

    usageLimits.interviews.used = recentInterviews.length;
    usageLimits.interviews.limit = planLimits.interviews || 1;
  } else {
    // For paid plans, ensure we reflect any changes from DB customizations
    usageLimits.spokenEnglish.limit = planLimits.spokenEnglish;
    usageLimits.interviews.limit = planLimits.interviews;
  }

  const interviewPrice = await subscriptionHelper.getPayPerUsePrice('INTERVIEW');
  const resumePrice = await subscriptionHelper.getPayPerUsePrice('RESUME');
  const englishTutorPrice = await subscriptionHelper.getPayPerUsePrice('ENGLISH_TUTOR');

  res.status(200).json({
    status: 'success',
    data: {
      subscription: user.subscription,
      usageLimits,
      payPerUsePrices: {
        interview: interviewPrice,
        resume: resumePrice,
        englishTutor: englishTutorPrice
      }
    }
  });
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findOne({ orderId });
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

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
      order.status = 'PAID';
      order.paymentDetails = cfOrder;
      await order.save();

      // Fulfill purchase
      await fulfillOrder(order, cfOrder);

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
    const cfErrorMsg = err.response?.data?.message || err.response?.data || err.message;
    return next(new AppError(`Error verifying payment: ${typeof cfErrorMsg === 'object' ? JSON.stringify(cfErrorMsg) : cfErrorMsg}`, 500));
  }
});

exports.handleWebhook = catchAsync(async (req, res, next) => {
  const { data } = req.body;
  
  if (data && data.order) {
    const cfOrderId = data.order.order_id;
    const cfOrderStatus = data.order.order_status;

    console.log(`Webhook received for Order ID: ${cfOrderId}, Status: ${cfOrderStatus}`);

    if (cfOrderStatus === 'PAID') {
      const order = await Order.findOne({ orderId: cfOrderId });
      if (order && order.status !== 'PAID') {
        order.status = 'PAID';
        order.paymentDetails = data;
        await order.save();

        await fulfillOrder(order, data);
      }
    }
  }

  res.status(200).json({ status: 'received' });
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  // Automatically mark pending orders older than 30 minutes as FAILED
  const expiryTime = new Date(Date.now() - 30 * 60 * 1000);
  await Order.updateMany(
    { status: 'PENDING', createdAt: { $lt: expiryTime } },
    { $set: { status: 'FAILED' } }
  );

  const orders = await Order.find()
    .populate('user', 'name email avatar')
    .populate('course', 'title')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders }
  });
});

// Admin config methods
exports.getPlans = catchAsync(async (req, res, next) => {
  const plans = await SubscriptionPlanConfig.find().sort('price');
  res.status(200).json({
    status: 'success',
    data: { plans }
  });
});

exports.updatePlan = catchAsync(async (req, res, next) => {
  const { planKey, price, offerings, spokenEnglishLimit, resumesLimit, interviewsLimit } = req.body;

  let plan = await SubscriptionPlanConfig.findOne({ planKey });
  if (!plan) {
    return next(new AppError('Plan key not found', 404));
  }

  if (price !== undefined) plan.price = price;
  if (offerings !== undefined) plan.offerings = offerings;
  if (spokenEnglishLimit !== undefined) plan.spokenEnglishLimit = spokenEnglishLimit;
  if (resumesLimit !== undefined) plan.resumesLimit = resumesLimit;
  if (interviewsLimit !== undefined) plan.interviewsLimit = interviewsLimit;

  await plan.save();

  res.status(200).json({
    status: 'success',
    data: { plan }
  });
});

exports.getPayPerUseConfigs = catchAsync(async (req, res, next) => {
  const configs = await PayPerUseConfig.find();
  
  if (configs.length === 0) {
    const defaults = [
      { featureType: 'INTERVIEW', price: 7 },
      { featureType: 'RESUME', price: 10 },
      { featureType: 'ENGLISH_TUTOR', price: 7 }
    ];
    await PayPerUseConfig.create(defaults);
    const seeded = await PayPerUseConfig.find();
    return res.status(200).json({
      status: 'success',
      data: { configs: seeded }
    });
  }

  res.status(200).json({
    status: 'success',
    data: { configs }
  });
});

exports.updatePayPerUseConfig = catchAsync(async (req, res, next) => {
  const { featureType, price } = req.body;

  if (price === undefined || typeof price !== 'number' || price < 0) {
    return next(new AppError('Please provide a valid price', 400));
  }

  let config = await PayPerUseConfig.findOne({ featureType });
  if (!config) {
    config = new PayPerUseConfig({ featureType, price });
  } else {
    config.price = price;
  }
  await config.save();

  res.status(200).json({
    status: 'success',
    data: { config }
  });
});

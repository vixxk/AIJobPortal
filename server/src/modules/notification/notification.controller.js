const Notification = require('./notification.model');
const catchAsync = require('../../utils/catchAsync');

exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Notification.countDocuments({ userId: req.user.id });
  const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    unreadCount,
    pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
    },
    data: {
      notifications
    }
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { read: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read'
  });
});

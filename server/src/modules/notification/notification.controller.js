const Notification = require('./notification.model');
const catchAsync = require('../../utils/catchAsync');
const sseEmitter = require('../../utils/sseManager');

const getNotificationsData = async (userId) => {
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  const unreadCount = await Notification.countDocuments({ userId, read: false });
  return { notifications, unreadCount };
};

exports.getNotificationsStream = catchAsync(async (req, res, next) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Disable buffering on Nginx if any
  });
  
  // Send initial data immediately
  const initialData = await getNotificationsData(req.user.id);
  res.write(`data: ${JSON.stringify(initialData)}\n\n`);
  
  const listener = async () => {
    try {
      const data = await getNotificationsData(req.user.id);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      console.error('SSE notification send error:', err);
    }
  };
  
  const eventName = `notification:${req.user.id}`;
  sseEmitter.on(eventName, listener);
  
  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 25000);
  
  req.on('close', () => {
    clearInterval(keepAlive);
    sseEmitter.off(eventName, listener);
  });
});

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
  
  // Notify active stream connection
  sseEmitter.emit(`notification:${req.user.id}`);

  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read'
  });
});

exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { userId: req.user.id, read: false },
    { read: true }
  );

  // Notify active stream connection
  sseEmitter.emit(`notification:${req.user.id}`);

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

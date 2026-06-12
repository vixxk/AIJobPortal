const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['APPLICATION_UPDATE', 'ACCOUNT_APPROVAL', 'SYSTEM_ALERT', 'JOB_POSTING', 'COURSE_UPDATE', 'INTERVIEW_REPORT', 'INTERVIEW_SCHEDULE', 'SYSTEM_UPDATE', 'PAYMENT_SUCCESS'],
    default: 'SYSTEM_ALERT'
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String
  }
}, { timestamps: true });
notificationSchema.index({ userId: 1, read: 1 });

notificationSchema.post('save', function(doc) {
  try {
    const sseEmitter = require('../../utils/sseManager');
    sseEmitter.emit(`notification:${doc.userId}`);
  } catch (err) {
    console.error('SSE notification post-save emit error:', err);
  }
});

notificationSchema.post('insertMany', function(docs) {
  try {
    const sseEmitter = require('../../utils/sseManager');
    docs.forEach(doc => {
      sseEmitter.emit(`notification:${doc.userId}`);
    });
  } catch (err) {
    console.error('SSE notification post-insertMany emit error:', err);
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;

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
    enum: ['APPLICATION_UPDATE', 'ACCOUNT_APPROVAL', 'SYSTEM_ALERT', 'JOB_POSTING', 'COURSE_UPDATE', 'INTERVIEW_REPORT', 'INTERVIEW_SCHEDULE'],
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
const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;

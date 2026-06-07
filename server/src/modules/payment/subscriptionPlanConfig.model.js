const mongoose = require('mongoose');

const subscriptionPlanConfigSchema = new mongoose.Schema({
  planKey: {
    type: String,
    enum: ['FREE', 'PRO', 'PRO_PLUS'],
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  offerings: {
    type: [String],
    default: []
  },
  spokenEnglishLimit: {
    type: Number,
    required: true
  },
  resumesLimit: {
    type: Number,
    required: true
  },
  interviewsLimit: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const SubscriptionPlanConfig = mongoose.model('SubscriptionPlanConfig', subscriptionPlanConfigSchema);

module.exports = SubscriptionPlanConfig;

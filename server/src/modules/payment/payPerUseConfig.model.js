const mongoose = require('mongoose');

const payPerUseConfigSchema = new mongoose.Schema({
  featureType: {
    type: String,
    enum: ['INTERVIEW', 'RESUME', 'ENGLISH_TUTOR'],
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const PayPerUseConfig = mongoose.model('PayPerUseConfig', payPerUseConfigSchema);

module.exports = PayPerUseConfig;

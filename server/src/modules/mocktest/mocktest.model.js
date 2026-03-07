const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [v => v.length >= 2, 'At least 2 options required']
  },
  correctAnswer: {
    type: Number, 
    required: true
  },
  marks: {
    type: Number,
    default: 1
  }
});
const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  negativeMarking: {
    type: Number,
    default: 0
  },
  questions: [questionSchema]
});
const mockTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Mock test title is required']
  },
  duration: {
    type: Number, 
    required: true
  },
  sections: [sectionSchema],
  createdBy: {
    type: String,
    default: 'SUPER_ADMIN'
  }
}, { timestamps: true });
const MockTest = mongoose.model('MockTest', mockTestSchema);
module.exports = MockTest;
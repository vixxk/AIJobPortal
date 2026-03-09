const mongoose = require('mongoose');
const savedJobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: String,
        required: true
    },
    jobData: {
        type: Object,
        required: true
    }
}, { timestamps: true });
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });
const SavedJob = mongoose.model('SavedJob', savedJobSchema);
module.exports = SavedJob;

const express = require('express');
const interviewController = require('./interview.controller');
const upload = require('../../utils/audioUpload');
const multer = require('multer');
const router = express.Router();

const { protect } = require('../../middleware/auth');

const uploadMemory = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.post('/start', uploadMemory.single('resume'), interviewController.startInterview);
router.post('/evaluate', upload.single('audio'), interviewController.processAnswer);
router.post('/transcribe', upload.single('audio'), interviewController.transcribeAudio);
router.post('/report', interviewController.generateReport);
router.post('/speak', interviewController.speakText);
module.exports = router;


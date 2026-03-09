const express = require('express');
const englishTutorController = require('./english-tutor.controller');
const { protect } = require('../../middleware/auth');
const upload = require('../../utils/audioUpload');

const router = express.Router();

router.use(protect);

router.get('/dashboard', englishTutorController.getDashboard);
router.post('/test/submit', englishTutorController.submitSpeakingTest);
router.get('/lesson', englishTutorController.getLesson);
router.post('/lesson/submit-task', upload.single('audio'), englishTutorController.submitLessonTask);
router.post('/lesson/complete', englishTutorController.completeLesson);

module.exports = router;

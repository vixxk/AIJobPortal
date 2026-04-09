const express = require('express');
const courseController = require('./course.controller');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/role');
const upload = require('../../middleware/upload');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(courseController.getAllCourses)
  .post(restrictTo('SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER'), upload.uploadImage, courseController.createCourse);

router.get('/my-courses', restrictTo('TEACHER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'), courseController.getMyCourses);

router
  .route('/:id')
  .get(courseController.getCourse)
  .patch(restrictTo('SUPER_ADMIN', 'TEACHER', 'COLLEGE_ADMIN'), upload.uploadImage, courseController.updateCourse)
  .delete(restrictTo('SUPER_ADMIN', 'COLLEGE_ADMIN'), courseController.deleteCourse);

router.post('/:id/enroll', courseController.enrollInCourse);
router.post('/:id/unenroll', restrictTo('SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER'), courseController.unenrollFromCourse);

// Chapter routes
router.post('/:id/chapters', restrictTo('SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER'), courseController.addChapter);
router.patch('/:id/chapters/:chapterId', restrictTo('SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER'), courseController.updateChapter);
router.delete('/:id/chapters/:chapterId', restrictTo('SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER'), courseController.deleteChapter);

// Lecture routes
router
  .route('/:courseId/lectures')
  .get(courseController.getLectures)
  .post(restrictTo('TEACHER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'), courseController.addLecture);

router
  .route('/lectures/:id')
  .patch(restrictTo('TEACHER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'), courseController.updateLecture)
  .delete(restrictTo('TEACHER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'), courseController.deleteLecture);

// Video upload to Bunny Stream
router.post(
  '/lectures/:id/upload-video',
  restrictTo('TEACHER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'),
  upload.uploadVideo,
  courseController.uploadLectureVideo
);

// Video processing status
router.get('/lectures/:id/video-status', courseController.getVideoStatus);

router.post('/lectures/:id/complete', courseController.markLectureComplete);
router.delete('/lectures/:id/complete', courseController.unmarkLectureComplete);

// Test routes
const testController = require('./test.controller');
router
  .route('/:courseId/tests')
  .get(testController.getCourseTests)
  .post(restrictTo('TEACHER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'), testController.createTest);

router
  .route('/tests/:id')
  .patch(restrictTo('TEACHER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'), testController.updateTest)
  .delete(restrictTo('TEACHER', 'SUPER_ADMIN', 'COLLEGE_ADMIN'), testController.deleteTest);

router.post('/tests/:id/submit', testController.submitTest);

module.exports = router;

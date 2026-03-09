const express = require('express');
const courseController = require('./course.controller');
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/role');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(courseController.getAllCourses)
  .post(restrictTo('SUPER_ADMIN', 'COLLEGE_ADMIN'), courseController.createCourse);

router.get('/my-courses', restrictTo('TEACHER', 'COLLEGE_ADMIN'), courseController.getMyCourses);

router
  .route('/:id')
  .get(courseController.getCourse)
  .patch(restrictTo('SUPER_ADMIN', 'TEACHER', 'COLLEGE_ADMIN'), courseController.updateCourse)
  .delete(restrictTo('SUPER_ADMIN', 'COLLEGE_ADMIN'), courseController.deleteCourse);

router
  .post('/:id/enroll', courseController.enrollInCourse);

router
  .route('/:courseId/lectures')
  .get(courseController.getLectures)
  .post(restrictTo('TEACHER', 'SUPER_ADMIN'), courseController.addLecture);

router
  .route('/lectures/:id')
  .patch(restrictTo('TEACHER', 'SUPER_ADMIN'), courseController.updateLecture)
  .delete(restrictTo('TEACHER', 'SUPER_ADMIN'), courseController.deleteLecture);

module.exports = router;

const Course = require('./course.model');
const Lecture = require('./lecture.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

exports.createCourse = catchAsync(async (req, res, next) => {
  if (!['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role)) {
    return next(new AppError('Unauthorized to create courses. Only administrators can create courses.', 403));
  }

  const course = await Course.create({
    ...req.body,
    teacher: req.user.id
  });

  res.status(201).json({
    status: 'success',
    data: { course }
  });
});

exports.updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('No course found with that ID', 404));

  if (course.teacher.toString() !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
    return next(new AppError('You can only update your own courses', 403));
  }

  const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: { course: updatedCourse }
  });
});

exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('No course found with that ID', 404));

  if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'COLLEGE_ADMIN') {
    return next(new AppError('You do not have permission to delete courses.', 403));
  }

  await Course.findByIdAndDelete(req.params.id);
  await Lecture.deleteMany({ course: req.params.id });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getMyCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find({ teacher: req.user.id });
  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: { courses }
  });
});

exports.getAllCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find().populate({
    path: 'teacher',
    select: 'name avatar'
  });

  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: { courses }
  });
});

exports.getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate('lectures')
    .populate({
      path: 'teacher',
      select: 'name avatar profile'
    });

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  const isEnrolled = course.enrolledStudents.includes(req.user.id) ||
                     course.teacher._id.toString() === req.user.id ||
                     req.user.role === 'SUPER_ADMIN';

  res.status(200).json({
    status: 'success',
    data: {
      course,
      isEnrolled
    }
  });
});

exports.enrollInCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { enrolledStudents: req.user.id } },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: { course }
  });
});

exports.addLecture = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);

  if (!course) return next(new AppError('Course not found', 404));
  if (course.teacher.toString() !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
    return next(new AppError('Only the teacher of this course or admin can add lectures', 403));
  }

  const lecture = await Lecture.create({
    ...req.body,
    course: courseId
  });

  res.status(201).json({
    status: 'success',
    data: { lecture }
  });
});

exports.getLectures = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);

  if (!course) return next(new AppError('Course not found', 404));

  const isEnrolled = course.enrolledStudents.includes(req.user.id) ||
                     course.teacher.toString() === req.user.id ||
                     req.user.role === 'SUPER_ADMIN';

  if (!isEnrolled) {
    return next(new AppError('You must be enrolled in this course to view lectures', 403));
  }

  const lectures = await Lecture.find({ course: courseId }).sort('createdAt');

  res.status(200).json({
    status: 'success',
    data: { lectures }
  });
});

exports.updateLecture = catchAsync(async (req, res, next) => {
  const lecture = await Lecture.findById(req.params.id).populate('course');
  if (!lecture) return next(new AppError('Lecture not found', 404));

  if (lecture.course.teacher.toString() !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
    return next(new AppError('Not authorized', 403));
  }

  const updatedLecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: { lecture: updatedLecture }
  });
});

exports.deleteLecture = catchAsync(async (req, res, next) => {
  const lecture = await Lecture.findById(req.params.id).populate('course');
  if (!lecture) return next(new AppError('Lecture not found', 404));

  if (lecture.course.teacher.toString() !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
    return next(new AppError('Not authorized', 403));
  }

  await Lecture.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

const Course = require('./course.model');
const Lecture = require('./lecture.model');
const LectureProgress = require('./progress.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const Notification = require('../notification/notification.model');

exports.createCourse = catchAsync(async (req, res, next) => {
  if (!['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role)) {
    return next(new AppError('Unauthorized to create courses. Only administrators can create courses.', 403));
  }

  const courseData = { ...req.body };
  if (req.file) {
    courseData.coverImage = `/uploads/avatars/${req.file.filename}`;
  }

  // Parse JSON fields if they come as strings
  if (typeof courseData.tags === 'string') {
    try { courseData.tags = JSON.parse(courseData.tags); } catch { courseData.tags = []; }
  }
  if (typeof courseData.prerequisites === 'string') {
    try { courseData.prerequisites = JSON.parse(courseData.prerequisites); } catch { courseData.prerequisites = []; }
  }
  if (typeof courseData.objectives === 'string') {
    try { courseData.objectives = JSON.parse(courseData.objectives); } catch { courseData.objectives = []; }
  }

  const course = await Course.create({
    ...courseData,
    teacher: courseData.teacher || req.user._id
  });

  res.status(201).json({
    status: 'success',
    data: { course }
  });
});

exports.updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('No course found with that ID', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = course.teacher?.toString() === req.user.id;

  if (!isAdmin && !isTeacher) {
    return next(new AppError('You can only update your own courses', 403));
  }

  const updateData = { ...req.body };

  // Parse JSON fields
  if (typeof updateData.tags === 'string') {
    try { updateData.tags = JSON.parse(updateData.tags); } catch { delete updateData.tags; }
  }
  if (typeof updateData.prerequisites === 'string') {
    try { updateData.prerequisites = JSON.parse(updateData.prerequisites); } catch { delete updateData.prerequisites; }
  }
  if (typeof updateData.objectives === 'string') {
    try { updateData.objectives = JSON.parse(updateData.objectives); } catch { delete updateData.objectives; }
  }

  if (req.file) {
    updateData.coverImage = `/uploads/avatars/${req.file.filename}`;
  }

  const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate({ path: 'teacher', select: 'name avatar' })
    .populate('lectures');

  res.status(200).json({
    status: 'success',
    data: { course: updatedCourse }
  });

  // If newly published, notify all students
  if (updateData.isPublished === true && !course.isPublished) {
    try {
        const User = require('../user/user.model');
        const students = await User.find({ role: 'STUDENT' }).select('_id');
        if (students.length > 0) {
            const notifications = students.map(s => ({
                userId: s._id,
                title: 'New Course Available! 📚',
                message: `A new course "${updatedCourse.title}" has been published. Enroll now to start learning!`,
                type: 'COURSE_UPDATE'
            }));
            await Notification.insertMany(notifications);
        }
    } catch (err) { }
  }
});

exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('No course found with that ID', 404));

  if (!['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role)) {
    return next(new AppError('You do not have permission to delete courses.', 403));
  }

  await Course.findByIdAndDelete(req.params.id);
  await Lecture.deleteMany({ course: req.params.id });

  res.status(204).json({ status: 'success', data: null });
});

exports.getMyCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find({ teacher: req.user.id })
    .populate({ path: 'teacher', select: 'name avatar' });
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
    .populate({
      path: 'lectures',
      options: { sort: { order: 1, createdAt: 1 } }
    })
    .populate({
      path: 'teacher',
      select: 'name avatar profile email'
    })
    .populate({
      path: 'enrolledStudents',
      select: 'name avatar email'
    });

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = course.teacher?._id?.toString() === req.user.id;
  const isEnrolled = course.enrolledStudents?.some(s => s?._id?.toString() === req.user.id);

  let completedLectures = [];
  if (isEnrolled || isTeacher || isAdmin) {
    const progress = await LectureProgress.find({
      user: req.user.id,
      course: course._id
    });
    completedLectures = progress.map(p => p.lecture);
  }

  res.status(200).json({
    status: 'success',
    data: {
      course,
      isEnrolled: isEnrolled || isTeacher || isAdmin,
      canEdit: isTeacher || isAdmin,
      completedLectures
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

  // Background notification
  try {
      await Notification.create({
          userId: req.user.id,
          title: 'Successfully Enrolled! 🎓',
          message: `You have successfully enrolled in the course: ${course.title}. Happy learning!`,
          type: 'COURSE_UPDATE'
      });
  } catch (err) { }
});

exports.unenrollFromCourse = catchAsync(async (req, res, next) => {
  const { studentId } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = course.teacher?.toString() === req.user.id;
  if (!isAdmin && !isTeacher) {
    return next(new AppError('Not authorized to remove students', 403));
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    { $pull: { enrolledStudents: studentId } },
    { new: true }
  ).populate({ path: 'enrolledStudents', select: 'name avatar email' });

  res.status(200).json({
    status: 'success',
    data: { course: updatedCourse }
  });
});

// ── Chapter Management ──────────────────────────────────────────────────────

exports.addChapter = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = course.teacher?.toString() === req.user.id;
  if (!isAdmin && !isTeacher) {
    return next(new AppError('Not authorized', 403));
  }

  course.chapters.push(req.body);
  await course.save();

  res.status(201).json({ status: 'success', data: { course } });
});

exports.updateChapter = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = course.teacher?.toString() === req.user.id;
  if (!isAdmin && !isTeacher) return next(new AppError('Not authorized', 403));

  const chapter = course.chapters.id(req.params.chapterId);
  if (!chapter) return next(new AppError('Chapter not found', 404));

  Object.assign(chapter, req.body);
  await course.save();

  res.status(200).json({ status: 'success', data: { course } });
});

exports.deleteChapter = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = course.teacher?.toString() === req.user.id;
  if (!isAdmin && !isTeacher) return next(new AppError('Not authorized', 403));

  course.chapters.pull(req.params.chapterId);
  await course.save();
  await Lecture.deleteMany({ course: req.params.id, chapter: req.params.chapterId });

  res.status(200).json({ status: 'success', data: { course } });
});

// ── Lecture Management ──────────────────────────────────────────────────────

exports.addLecture = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);

  if (!course) return next(new AppError('Course not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = course.teacher?.toString() === req.user.id;
  if (!isAdmin && !isTeacher) {
    return next(new AppError('Only the teacher or admin can add lectures', 403));
  }

  const lecture = await Lecture.create({ ...req.body, course: courseId });

  res.status(201).json({ status: 'success', data: { lecture } });
});

exports.getLectures = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);

  if (!course) return next(new AppError('Course not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = course.teacher?.toString() === req.user.id;
  const isEnrolled = course.enrolledStudents.includes(req.user.id);

  if (!isEnrolled && !isTeacher && !isAdmin) {
    return next(new AppError('You must be enrolled in this course to view lectures', 403));
  }

  const lectures = await Lecture.find({ course: courseId }).sort({ order: 1, createdAt: 1 });

  res.status(200).json({ status: 'success', data: { lectures } });
});

exports.updateLecture = catchAsync(async (req, res, next) => {
  const lecture = await Lecture.findById(req.params.id).populate('course');
  if (!lecture) return next(new AppError('Lecture not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = lecture.course?.teacher?.toString() === req.user.id;
  if (!isAdmin && !isTeacher) {
    return next(new AppError('Not authorized', 403));
  }

  const updatedLecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ status: 'success', data: { lecture: updatedLecture } });
});

exports.deleteLecture = catchAsync(async (req, res, next) => {
  const lecture = await Lecture.findById(req.params.id).populate('course');
  if (!lecture) return next(new AppError('Lecture not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = lecture.course?.teacher?.toString() === req.user.id;
  if (!isAdmin && !isTeacher) {
    return next(new AppError('Not authorized', 403));
  }

  await Lecture.findByIdAndDelete(req.params.id);

  res.status(204).json({ status: 'success', data: null });
});

exports.markLectureComplete = catchAsync(async (req, res, next) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return next(new AppError('Lecture not found', 404));

  await LectureProgress.findOneAndUpdate(
    { user: req.user.id, lecture: lecture._id },
    { user: req.user.id, lecture: lecture._id, course: lecture.course },
    { upsert: true, new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Lecture marked as complete'
  });
});

exports.unmarkLectureComplete = catchAsync(async (req, res, next) => {
  await LectureProgress.findOneAndDelete({
    user: req.user.id,
    lecture: req.params.id
  });

  res.status(200).json({
    status: 'success',
    message: 'Lecture marked as incomplete'
  });
});

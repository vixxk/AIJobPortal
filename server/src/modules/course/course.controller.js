const Course = require('./course.model');
const Lecture = require('./lecture.model');
const LectureProgress = require('./progress.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const Notification = require('../notification/notification.model');
const { uploadFile } = require('../../utils/fileUpload');
const bunnyService = require('../../services/bunny.service');

exports.createCourse = catchAsync(async (req, res, next) => {
  if (!['SUPER_ADMIN', 'COLLEGE_ADMIN', 'TEACHER'].includes(req.user.role)) {
    return next(new AppError('Unauthorized to create courses.', 403));
  }

  const courseData = { ...req.body };
  if (['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role)) {
    courseData.approvalStatus = 'APPROVED';
  } else {
    courseData.approvalStatus = 'PENDING';
  }
  if (req.file) {
    const result = await uploadFile(req.file, 'courses/covers', false, 'avatars');
    courseData.coverImage = result.url;
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
    const result = await uploadFile(req.file, 'courses/covers', false, 'avatars');
    updateData.coverImage = result.url;
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

  // Delete all bunny videos for this course's lectures
  const lectures = await Lecture.find({ course: req.params.id });
  for (const lecture of lectures) {
    if (lecture.bunnyVideoId) {
      try { await bunnyService.deleteVideo(lecture.bunnyVideoId); } catch (err) {
        console.error(`Failed to delete Bunny video ${lecture.bunnyVideoId}:`, err.message);
      }
    }
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
  const courses = await Course.find({ approvalStatus: 'APPROVED' }).populate({
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
  const isTeacher = (course.teacher?._id || course.teacher)?.toString() === (req.user._id || req.user.id)?.toString();
  const isEnrolled = course.enrolledStudents?.some(s => (s?._id || s)?.toString() === (req.user._id || req.user.id)?.toString());

  if (course.approvalStatus !== 'APPROVED' && !isAdmin && !isTeacher) {
    return next(new AppError('Course not found or pending approval', 404));
  }

  let completedLectures = [];
  if (isEnrolled || isTeacher || isAdmin) {
    const progress = await LectureProgress.find({
      user: req.user.id,
      course: course._id
    });
    completedLectures = progress.map(p => p.lecture);
  }

  const hasFullAccess = isEnrolled || isTeacher || isAdmin;

  // Protect sensitive content if user doesn't have full access
  if (!hasFullAccess && course.lectures) {
    course.lectures = course.lectures.map(lecture => {
      if (!lecture.isPreview) {
        const leanLecture = lecture.toObject ? lecture.toObject() : { ...lecture };
        delete leanLecture.bunnyVideoId;
        delete leanLecture.videoIdentifier;
        return leanLecture;
      }
      return lecture;
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      course,
      isEnrolled: hasFullAccess,
      canEdit: isTeacher || isAdmin,
      completedLectures
    }
  });
});

exports.enrollInCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) return next(new AppError('Course not found', 404));

  if (course.price > 0) {
    return next(new AppError('This is a paid course. Please use the payment gateway to enroll.', 403));
  }

  await Course.findByIdAndUpdate(
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

  // Delete bunny videos for lectures in this chapter
  const chapterLectures = await Lecture.find({ course: req.params.id, chapter: req.params.chapterId });
  for (const lecture of chapterLectures) {
    if (lecture.bunnyVideoId) {
      try { await bunnyService.deleteVideo(lecture.bunnyVideoId); } catch (err) {
        console.error(`Failed to delete Bunny video ${lecture.bunnyVideoId}:`, err.message);
      }
    }
  }

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

  // Background notification for enrolled students
  if (course.enrolledStudents && course.enrolledStudents.length > 0) {
    try {
      const notifications = course.enrolledStudents.map(studentId => ({
        userId: studentId,
        title: 'New Content Added! 📹',
        message: `A new video "${lecture.title}" has been added to your course: ${course.title}. Check it out now!`,
        type: 'COURSE_UPDATE'
      }));
      await Notification.insertMany(notifications);
    } catch (err) { }
  }
});

exports.getLectures = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);

  if (!course) return next(new AppError('Course not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = (course.teacher?._id || course.teacher)?.toString() === (req.user._id || req.user.id)?.toString();
  const isEnrolled = course.enrolledStudents?.some(s => (s?._id || s)?.toString() === (req.user._id || req.user.id)?.toString());

  if (!isEnrolled && !isTeacher && !isAdmin) {
    return next(new AppError('You must be enrolled in this course to view the full content', 403));
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

  // Delete from Bunny Stream
  if (lecture.bunnyVideoId) {
    try { await bunnyService.deleteVideo(lecture.bunnyVideoId); } catch (err) {
      console.error(`Failed to delete Bunny video ${lecture.bunnyVideoId}:`, err.message);
    }
  }

  await Lecture.findByIdAndDelete(req.params.id);

  res.status(204).json({ status: 'success', data: null });
});

// ── Video Upload to Bunny Stream ────────────────────────────────────────────

exports.uploadLectureVideo = catchAsync(async (req, res, next) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return next(new AppError('Lecture not found', 404));

  const course = await Course.findById(lecture.course);
  if (!course) return next(new AppError('Course not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = course.teacher?.toString() === req.user.id;
  if (!isAdmin && !isTeacher) {
    return next(new AppError('Not authorized to upload videos', 403));
  }

  if (!req.file) {
    return next(new AppError('Please provide a video file', 400));
  }

  // If there is an existing bunny video, delete it first
  if (lecture.bunnyVideoId) {
    try { await bunnyService.deleteVideo(lecture.bunnyVideoId); } catch (err) {
      console.error('Failed to delete old Bunny video:', err.message);
    }
  }

  // Step 1: Create video object in Bunny
  const bunnyVideo = await bunnyService.createVideo(lecture.title);
  const videoId = bunnyVideo.guid;

  // Step 2: Upload the file buffer to Bunny
  await bunnyService.uploadVideo(videoId, req.file.buffer);

  // Step 3: Update lecture with Bunny references
  const thumbnailUrl = bunnyService.getThumbnailUrl(videoId);

  lecture.bunnyVideoId = videoId;
  lecture.videoStatus = 'PROCESSING';
  lecture.thumbnailUrl = thumbnailUrl;
  await lecture.save();

  res.status(200).json({
    status: 'success',
    message: 'Video uploaded successfully. Processing may take a few minutes.',
    data: {
      lecture,
      embedUrl: bunnyService.getEmbedUrl(videoId)
    }
  });
});

// ── Get Video Status from Bunny ─────────────────────────────────────────────

exports.getVideoStatus = catchAsync(async (req, res, next) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return next(new AppError('Lecture not found', 404));

  // Authorization: only enrolled users, teachers, or admins can check status
  const course = await Course.findById(lecture.course);
  if (!course) return next(new AppError('Course not found', 404));

  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = (course.teacher?._id || course.teacher)?.toString() === (req.user._id || req.user.id)?.toString();
  const isEnrolled = course.enrolledStudents?.some(s => (s?._id || s)?.toString() === (req.user._id || req.user.id)?.toString());

  if (!isEnrolled && !isTeacher && !isAdmin) {
    return next(new AppError('Not authorized to access this video', 403));
  }

  if (!lecture.bunnyVideoId) {
    return res.status(200).json({
      status: 'success',
      data: { videoStatus: 'PENDING', bunnyStatus: null }
    });
  }

  try {
    const bunnyData = await bunnyService.getVideo(lecture.bunnyVideoId);

    // Bunny status values: 0 = created, 1 = uploaded, 2 = processing, 3 = transcoding, 4 = finished, 5 = error, 6 = upload failed
    let videoStatus = 'PROCESSING';
    if (bunnyData.status === 4) {
      videoStatus = 'READY';
    } else if (bunnyData.status === 5 || bunnyData.status === 6) {
      videoStatus = 'FAILED';
    }

    // Update lecture status if changed
    if (lecture.videoStatus !== videoStatus) {
      lecture.videoStatus = videoStatus;
      await lecture.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        videoStatus,
        bunnyStatus: bunnyData.status,
        encodeProgress: bunnyData.encodeProgress || 0,
        length: bunnyData.length || 0
      }
    });
  } catch (err) {
    res.status(200).json({
      status: 'success',
      data: { videoStatus: lecture.videoStatus, bunnyStatus: null }
    });
  }
});

exports.markLectureComplete = catchAsync(async (req, res, next) => {
  const lecture = await Lecture.findById(req.params.id);
  const course = await Course.findById(lecture.course);
  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = (course?.teacher?._id || course?.teacher)?.toString() === (req.user._id || req.user.id)?.toString();
  const isEnrolled = course?.enrolledStudents?.some(s => (s?._id || s)?.toString() === (req.user._id || req.user.id)?.toString());

  if (!isEnrolled && !isTeacher && !isAdmin) {
    return next(new AppError('You must be enrolled in this course to track progress', 403));
  }

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
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return next(new AppError('Lecture not found', 404));

  const course = await Course.findById(lecture.course);
  const isAdmin = ['SUPER_ADMIN', 'COLLEGE_ADMIN'].includes(req.user.role);
  const isTeacher = (course?.teacher?._id || course?.teacher)?.toString() === (req.user._id || req.user.id)?.toString();
  const isEnrolled = course?.enrolledStudents?.some(s => (s?._id || s)?.toString() === (req.user._id || req.user.id)?.toString());

  if (!isEnrolled && !isTeacher && !isAdmin) {
    return next(new AppError('Unauthorized', 403));
  }

  await LectureProgress.findOneAndDelete({
    user: req.user.id,
    lecture: req.params.id
  });

  res.status(200).json({
    status: 'success',
    message: 'Lecture marked as incomplete'
  });
});

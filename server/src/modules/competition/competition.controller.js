const Competition = require('./competition.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { uploadFile } = require('../../utils/fileUpload');
exports.createCompetition = catchAsync(async (req, res, next) => {
  const data = { ...req.body };
  if (req.file) {
    const result = await uploadFile(req.file, 'competitions/banners', false, 'avatars');
    data.bannerImage = result.url;
  }
  
  if (data.rounds && typeof data.rounds === 'string') {
    try {
      data.rounds = JSON.parse(data.rounds);
    } catch (e) {
      data.rounds = [];
    }
  }

  data.createdBy = req.user.id;
  data.status = 'PENDING';
  const newCompetition = await Competition.create(data);
  
  res.status(201).json({
    status: 'success',
    data: {
      competition: newCompetition
    }
  });
});

exports.getAllCompetitions = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  const queryObj = { status: 'APPROVED' };
  const competitions = await Competition.find(queryObj)
    .skip(skip)
    .limit(limit)
    .sort('-createdAt')
    .lean();
  const total = await Competition.countDocuments(queryObj);
  res.status(200).json({
    status: 'success',
    results: competitions.length,
    pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
    },
    data: {
      competitions
    }
  });
});

exports.getMyCompetitions = catchAsync(async (req, res, next) => {
    const competitions = await Competition.find({ createdBy: req.user.id })
        .sort('-createdAt')
        .lean();
    
    res.status(200).json({
        status: 'success',
        results: competitions.length,
        data: {
            competitions
        }
    });
});

exports.getCompetition = catchAsync(async (req, res, next) => {
  const competition = await Competition.findById(req.params.id)
    .populate({
        path: 'participants',
        select: 'name email avatar studentProfile',
        populate: {
            path: 'studentProfile'
        }
    })
    .lean({ virtuals: true }); // Adding virtuals to lean for studentProfile
    
  if (!competition) {
    return next(new AppError('No competition found with that ID', 404));
  }
  
  // If not approved, only creator or admin can see it
  if (competition.status !== 'APPROVED') {
      // Check if user is logged in and is either creator or admin
      const isCreator = req.user && competition.createdBy && req.user.id === competition.createdBy.toString();
      const isAdmin = req.user && (req.user.role === 'SUPER_ADMIN');
      
      if (!isCreator && !isAdmin) {
          return next(new AppError('This competition is pending approval.', 403));
      }
  }

  res.status(200).json({
    status: 'success',
    data: {
      competition
    }
  });
});

exports.updateCompetition = catchAsync(async (req, res, next) => {
    const data = { ...req.body };
    if (req.file) {
        const result = await uploadFile(req.file, 'competitions/banners', false, 'avatars');
        data.bannerImage = result.url;
    }

    if (data.rounds && typeof data.rounds === 'string') {
        try {
            data.rounds = JSON.parse(data.rounds);
        } catch (e) {
            // Keep existing if error
        }
    }

    data.status = 'PENDING';

    const competition = await Competition.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.user.id },
        data,
        { new: true, runValidators: true }
    );

    if (!competition) {
        return next(new AppError('Competition not found or unauthorized', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { competition }
    });
});

exports.deleteCompetition = catchAsync(async (req, res, next) => {
    const competition = await Competition.findOneAndDelete({
        _id: req.params.id,
        createdBy: req.user.id
    });

    if (!competition) {
        return next(new AppError('Competition not found or unauthorized', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.registerCompetition = catchAsync(async (req, res, next) => {
  const competition = await Competition.findById(req.params.id);
  if (!competition) {
    return next(new AppError('No competition found with that ID', 404));
  }
  
  if (competition.participants.includes(req.user.id)) {
    return next(new AppError('You are already registered for this competition', 400));
  }

  competition.participants.push(req.user.id);
  await competition.save();

  res.status(200).json({
    status: 'success',
    data: {
      competition
    }
  });
});

exports.unregisterCompetition = catchAsync(async (req, res, next) => {
  const competition = await Competition.findById(req.params.id);
  if (!competition) {
    return next(new AppError('No competition found with that ID', 404));
  }
  competition.participants = competition.participants.filter(
    id => id.toString() !== req.user.id.toString()
  );
  await competition.save();

  res.status(200).json({
    status: 'success',
    data: {
      competition
    }
  });
});

exports.downloadCompetitionParticipants = catchAsync(async (req, res, next) => {
    const competition = await Competition.findById(req.params.id)
        .populate({
            path: 'participants',
            select: 'name email studentProfile',
            populate: {
                path: 'studentProfile'
            }
        })
        .lean();

    if (!competition) {
        return next(new AppError('No competition found with that ID', 404));
    }

    // Check authorization: Only admin or creator
    const isAdmin = req.user && req.user.role === 'SUPER_ADMIN';
    const isCreator = req.user && (competition.createdBy && competition.createdBy.toString() === req.user.id);

    if (!isAdmin && !isCreator) {
        return next(new AppError('You are not authorized to download this data.', 403));
    }

    if (!competition.participants || competition.participants.length === 0) {
        return next(new AppError('No participants to download.', 400));
    }

    // Prepare CSV data
    const header = ['Name', 'Email', 'Phone', 'Skills', 'University', 'Degree', 'Current Position'];
    const rows = competition.participants.map(user => {
        const profile = user.studentProfile || {};
        return [
            user.name || '',
            user.email || '',
            profile.phoneNumber || '',
            (profile.skills || []).join('; '),
            (profile.education && profile.education[0]?.institution) || '',
            (profile.education && profile.education[0]?.degree) || '',
            profile.currentPosition || ''
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [header.join(','), ...rows].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment(`${competition.title.replace(/\s+/g, '_')}_Participants.csv`);
    res.status(200).send(csvContent);
});

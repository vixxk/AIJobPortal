const Competition = require('./competition.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
exports.createCompetition = catchAsync(async (req, res, next) => {
  const data = { ...req.body };
  if (req.file) {
    data.bannerImage = `/uploads/avatars/${req.file.filename}`;
  }
  
  if (data.rounds && typeof data.rounds === 'string') {
    try {
      data.rounds = JSON.parse(data.rounds);
    } catch (e) {
      data.rounds = [];
    }
  }

  data.createdBy = req.user.id;
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
  const competitions = await Competition.find()
    .skip(skip)
    .limit(limit)
    .sort('-createdAt')
    .lean();
  const total = await Competition.countDocuments();
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
        select: 'name email avatar'
    })
    .lean();
    
  if (!competition) {
    return next(new AppError('No competition found with that ID', 404));
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
        data.bannerImage = `/uploads/avatars/${req.file.filename}`;
    }

    if (data.rounds && typeof data.rounds === 'string') {
        try {
            data.rounds = JSON.parse(data.rounds);
        } catch (e) {
            // Keep existing if error
        }
    }

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

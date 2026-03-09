const Competition = require('./competition.model');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
exports.createCompetition = catchAsync(async (req, res, next) => {
  const newCompetition = await Competition.create(req.body);
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

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./modules/auth/auth.routes');
const studentRoutes = require('./modules/student/student.routes');
const recruiterRoutes = require('./modules/recruiter/recruiter.routes');
const collegeRoutes = require('./modules/college/college.routes');
const jobRoutes = require('./modules/job/job.routes');
const applicationRoutes = require('./modules/application/application.routes');
const competitionRoutes = require('./modules/competition/competition.routes');
const notificationRoutes = require('./modules/notification/notification.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const interviewRoutes = require('./modules/interview/interview.routes');
const englishTutorRoutes = require('./modules/english-tutor/english-tutor.routes');
const courseRoutes = require('./modules/course/course.routes');
const legacyJobsRouter = require('../routes/jobs');
const legacyResumeRouter = require('../routes/resume');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', apiLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

connectDB();

app.get('/', (req, res) => {
  res.send('Job Portal API is running... Modular Version.');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/recruiter', recruiterRoutes);
app.use('/api/v1/college', collegeRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/competitions', competitionRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/interview', interviewRoutes);
app.use('/api/v1/english-tutor', englishTutorRoutes);
app.use('/api/v1/courses', courseRoutes);

app.use('/api/jobs', legacyJobsRouter);
app.use('/api/resume', legacyResumeRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

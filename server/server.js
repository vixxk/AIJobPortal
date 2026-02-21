const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const connectDB = async () => {
  try {
    // Only connect if URI is defined, else just skip for MVP
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB Connected');
    } else {
        console.log('MongoDB URI not defined, skipping DB connection for now.');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

connectDB();

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Routes
const jobsRouter = require('./routes/jobs');
const resumeRouter = require('./routes/resume');

app.use('/api/jobs', jobsRouter);
app.use('/api/resume', resumeRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

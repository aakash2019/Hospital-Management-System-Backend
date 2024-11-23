// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Import and use routes
const doctor = require('./routes/doctor');
const patient = require('./routes/patient');
const admin = require('./routes/admin');
const hospital = require('./routes/hospital');

app.use(cors({
  origin: 'http://localhost:3000', // Adjust as necessary
  credentials: true, // If your API requires cookie-based sessions
}));

// Middleware
app.use(express.json());

// Route Middleware
app.use('/api/doctor', doctor);
app.use('/api/patient', patient);
app.use('/api/admin', admin);
app.use('/api/hospital', hospital);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

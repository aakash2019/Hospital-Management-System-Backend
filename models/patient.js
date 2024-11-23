const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Ensures the email is unique for each admin
    trim: true,
    lowercase: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  diseases: {
    type: [String],  // Array of disease names
    required: false,
  },
  treatment: {
    type: [String],
    required: false,
  },
  medicine: {
    type: [String],  // Array of medicines
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,   // Ensure password is not returned in queries by default
  },
  isAdmin: {
    type: Boolean,
    default: false  // Sets patient status to false by default
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Patient', patientSchema);

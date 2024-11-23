const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
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
  hospital: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',  // Reference to Hospital model
  }],
  specialty: {
    type: String,
    required: true,
  },
  patients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',  // Reference to Patient model
  }],
  pendingRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',  // Reference to Patient model
  }],
  password: {
    type: String,
    required: true,
    select: false,   // Ensure password is not returned in queries by default
  },

  isAdmin: {
    type: Boolean,
    default: false  // Sets doctor status to false by default
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Doctor', doctorSchema);

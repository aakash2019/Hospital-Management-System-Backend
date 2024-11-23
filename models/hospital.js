const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
  },
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',  // Reference to Doctor model
  }]
}, {
  timestamps: true  // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Hospital', hospitalSchema);

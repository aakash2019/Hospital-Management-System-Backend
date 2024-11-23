const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: true,
    select: false,  // Hides password from query results by default
  },
  isAdmin: {
    type: Boolean,
    default: true  // Sets admin status to true by default
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Admin', adminSchema);

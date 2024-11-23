const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');          // Assuming Admin model path
const Hospital = require('../models/Hospital');    // Assuming Hospital model path
const Doctor = require('../models/Doctor');        // Assuming Doctor model path

// JWT secret (put this in an environment variable for production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Admin Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if an admin already exists
    const existingAdmin = await Admin.findOne({ isAdmin: true });
    if (existingAdmin) {
      return res.status(400).json({ message: 'An admin already exists. Only one admin is allowed.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, email, password: hashedPassword });

    await newAdmin.save();
    const token = jwt.sign({ adminId: newAdmin._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ 
      message: 'Admin registered successfully', 
      token, 
      admin: {
        name: newAdmin.name,
        email: newAdmin.email,
        isAdmin: newAdmin.isAdmin,
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const newAdmin = await Admin.findOne({ email }).select('+password');

    if (!newAdmin || !(await bcrypt.compare(password, newAdmin.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ adminId: newAdmin._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ 
      message: 'Login successful', 
      token, 
      admin: {
        name: newAdmin.name,
        email: newAdmin.email,
        isAdmin: newAdmin.isAdmin,
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add New Hospital
exports.addHospital = async (req, res) => {
  try {
    // Authorization Check: Only admins can add hospitals
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access. Admins only.' });
    }
    const { name, city } = req.body;

    const newHospital = new Hospital({ name, city });
    await newHospital.save();

    res.status(201).json({ message: 'Hospital added successfully', hospital: newHospital });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Doctors 
exports.getAllDoctors = async (req, res) => {
  try {
    // Authorization Check: Only admins can get doctors
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access. Admins only.' });
    }
    const doctors = await Doctor.find();
    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit Hospital Details
exports.editHospital = async (req, res) => {
  try {
    // Authorization Check: Only admins can add hospitals
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access. Admins only.' });
    }
    const { hospitalId } = req.params;
    const { name, city } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    hospital.name = name || hospital.name;
    hospital.city = city || hospital.city;
    await hospital.save();

    res.json({ message: 'Hospital details updated successfully', hospital });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Hospital
exports.deleteHospital = async (req, res) => {
  try {
    // Authorization Check: Only admins can add hospitals
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access. Admins only.' });
    }
    const { hospitalId } = req.params;

    // Find and delete the hospital
    const hospital = await Hospital.findByIdAndDelete(hospitalId);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    // Set hospital field to null in all doctors linked to this hospital
    await Doctor.updateMany({ hospital: hospitalId }, { $set: { hospital: null } });

    res.json({ message: 'Hospital and associated references deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Doctor to Hospital
exports.addDoctorToHospital = async (req, res) => {
  try {
    // Authorization Check: Only admins can add hospitals
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access. Admins only.' });
    }
    const { hospitalId, doctorId } = req.body;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Check if doctor is already associated with the hospital
    if (hospital.doctors.includes(doctorId)) {
      return res.status(400).json({ message: 'Doctor already exists in the hospital' });
    }
    
    // Add hospital to doctor and doctor to hospital
    doctor.hospital.push(hospitalId);
    await doctor.save();

    hospital.doctors.push(doctorId);
    await hospital.save();

    res.json({ message: 'Doctor added to hospital successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove Doctor from Hospital
exports.removeDoctorFromHospital = async (req, res) => {
  try {
    // Authorization Check: Only admins can remove doctors from hospitals
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access. Admins only.' });
    }

    const { hospitalId, doctorId } = req.body;

    // Validate hospitalId and doctorId format
    if (!mongoose.Types.ObjectId.isValid(hospitalId) || !mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid Hospital ID or Doctor ID format' });
    }

    // Find the hospital by ID
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Check if doctor is currently associated with this hospital
    if (doctor.hospital?.toString() !== hospitalId) {
      return res.status(400).json({ message: 'Doctor is not associated with this hospital' });
    }

    // Remove the doctor from the hospital's doctors list
    hospital.doctors = hospital.doctors.filter(id => id.toString() !== doctorId);

    // Set the doctor’s hospital field to null
    doctor.hospital = null;

    // Save both updates
    await doctor.save();
    await hospital.save();

    res.json({ message: 'Doctor removed from hospital successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check if admin exists
exports.adminExists = async (req, res) =>{
  try {
    const adminExists = await Admin.findOne();
    res.json({ exists: !!adminExists });
  } catch (error) {
    console.log("Error in adminExists function:",error.message);
    res.status(500).json({ error: error.message });
  }
}
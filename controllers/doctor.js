const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');  // Assuming Doctor model path
const Patient = require('../models/Patient');  // Assuming Patient model path
const Hospital = require('../models/Hospital');

// Secret key for JWT (put this in an environment variable for production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

exports.signup = async (req, res) => {
  try {
    const { name, email, hospital, specialty, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !hospital || !specialty || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if hospital ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(hospital)) {
      return res.status(400).json({ message: 'Invalid hospital ID format' });
    }

    // Verify that the hospital exists
    const hospitalExists = await Hospital.findById(hospital);
    if (!hospitalExists) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new doctor entry
    const newDoctor = new Doctor({
      name,
      email,
      hospital,
      specialty,
      password: hashedPassword
    });

    await newDoctor.save();

    res.status(201).json({
      message: 'Doctor registered successfully',
      doctor: newDoctor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Doctor Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email }).select('+password');

    if (!doctor || !(await bcrypt.compare(password, doctor.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ doctorId: doctor._id }, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token, doctor: doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add New Patient (Accept/Decline Request)
exports.managePatientRequest = async (req, res) => {
  try {
    const { doctorId, patientId, action } = req.body;  // action: 'accept' or 'decline'

    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Check if patientId is in pendingRequests
    if (!doctor.pendingRequests.includes(patientId)) {
      return res.status(400).json({ message: 'No pending request from this patient' });
    }

    if (action === 'accept') {
      // Add patient to doctor's patients list if not already present
      if (!doctor.patients.includes(patientId)) {
        doctor.patients.push(patientId);
      }
      // Remove patientId from pendingRequests
      doctor.pendingRequests = doctor.pendingRequests.filter(id => id.toString() !== patientId);
      await doctor.save();
      res.json({ message: 'Patient added to doctor’s records' });
    } else if (action === 'decline') {
      // Remove patientId from pendingRequests without adding to patients list
      doctor.pendingRequests = doctor.pendingRequests.filter(id => id.toString() !== patientId);
      await doctor.save();
      res.json({ message: 'Patient request declined' });
    } else {
      res.status(400).json({ message: 'Invalid action. Use "accept" or "decline"' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit Patient Details
exports.editPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { diseases, treatment, medicine } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    patient.diseases = diseases || patient.diseases;
    patient.treatment = treatment || patient.treatment;
    patient.medicine = medicine || patient.medicine;
    await patient.save();

    res.json({ message: 'Patient details updated successfully', patient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Patient from Doctor's Record
exports.deletePatient = async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    // // Validate doctorId as a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID format' });
    }

    const doctor = await Doctor.findById(doctorId);

    // Check if doctor exists
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Ensure patients array exists, then filter it
    doctor.patients = (doctor.patients || []).filter(id => id.toString() !== patientId);
    await doctor.save();

    res.json({ message: 'Patient removed from doctor’s records' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit Doctor's Own Details
exports.editDoctorDetails = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { name, hospital, specialty } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (name) doctor.name = name;
    if (hospital) doctor.hospital = hospital;
    if (specialty) doctor.specialty = specialty;

    await doctor.save();
    res.json({ message: 'Doctor details updated successfully', doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDoctorHospitals = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const hospitals = [];

    const doctorHospitals = doctor.hospital.map((hospital) => hospital.toString());

    // Find the hospital using the hospitalId from the doctor
    for (const hospitalId of doctorHospitals) {
      const hospitalDetail = await Hospital.findById(hospitalId, "name city"); // Fetch only name and city fields
      if (hospitalDetail) {
        hospitals.push({
          name: hospitalDetail.name,
          city: hospitalDetail.city,
        });
      }
    }

    if (!hospitals) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Return hospital details
    res.json({ hospitals });
  } catch (error) {
    console.error("Error fetching hospital for doctor:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
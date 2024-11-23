const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');  // Assuming Patient model path
const Doctor = require('../models/Doctor');    // Assuming Doctor model path

// Secret key for JWT (put this in an environment variable for production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Patient Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, age, gender, address, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newPatient = new Patient({
      name,
      email,
      age,
      gender,
      address,
      password: hashedPassword,
    });

    await newPatient.save();
    res.status(201).json({ message: 'Patient registered successfully', patient: newPatient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Patient Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const patient = await Patient.findOne({ email }).select('+password');

    if (!patient || !(await bcrypt.compare(password, patient.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ patientId: patient._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, patient: patient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Edit Patient's Own Details
exports.editPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { name, age, address } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    patient.name = name || patient.name;
    patient.age = age || patient.age;
    patient.address = address || patient.address;
    await patient.save();

    res.json({ message: 'Patient details updated successfully', patient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send Request to Doctor
exports.requestDoctor = async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;

    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Initialize the pendingRequests array if it doesn't exist
    if (!doctor.pendingRequests) doctor.pendingRequests = [];

    // Check if patientId is already in pendingRequests
    if (doctor.pendingRequests.includes(patientId)) {
      return res.status(400).json({ message: 'Request already sent to this doctor' });
    }

    // Add patientId to the pendingRequests list
    doctor.pendingRequests.push(patientId);

    // Save the updated doctor document
    await doctor.save();
    res.json({ message: 'Request sent to doctor. Waiting for approval.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

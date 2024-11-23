const Hospital = require('../models/Hospital');   // Assuming Hospital model path
const Doctor = require('../models/Doctor');       // Assuming Doctor model path
const mongoose = require('mongoose');


// Get Single Hospital by ID
exports.getHospitalById = async (req, res) => {
  try {
    // Authorization Check: Only admins can view hospital details
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access. Admins only.' });
    }

    const { hospitalId } = req.params;

    // Validate if hospitalId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ message: 'Invalid Hospital ID' });
    }

    // Use findOne instead of findById
    const hospital = await Hospital.findOne({ _id: hospitalId });

    if (!hospital) {
      console.log(`No hospital found with ID: ${hospitalId}`);
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json({ hospital });
  } catch (error) {
    console.error("Error fetching hospital by ID:", error);  // Log error details
    res.status(500).json({ error: error.message });
  }
};

// Get All Hospitals
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json({ hospitals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get Doctors Associated with a Hospital
exports.getDoctorsInHospital = async (req, res) => {
  try {
    // Authorization Check: Only admins can add hospitals
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access. Admins only.' });
    }

    const { hospitalId } = req.params;

    const hospital = await Hospital.findById(hospitalId).populate('doctors');
    if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

    res.json({ doctors: hospital.doctors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search Hospitals by City
exports.getHospitalsByCity = async (req, res) => {
  try {
    // Authorization Check: Only admins can add hospitals
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access. Admins only.' });
    }

    const { city } = req.params;
    const hospitals = await Hospital.find({ city: city });

    if (hospitals.length === 0) return res.status(404).json({ message: 'No hospitals found in this city' });
    res.json({ hospitals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
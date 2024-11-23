const express = require('express');
const router = express.Router();
const doctor = require('../controllers/doctor');

router.post('/signup', doctor.signup);
router.post('/login', doctor.login);
router.post('/patients', doctor.managePatientRequest);        
router.put('/patient/:patientId', doctor.editPatientDetails);
router.delete('/patient', doctor.deletePatient);
router.put('/:doctorId', doctor.editDoctorDetails);
router.get('/:doctorId/hospitals', doctor.getDoctorHospitals);

module.exports = router;

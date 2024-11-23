const express = require('express');
const router = express.Router();
const patient = require('../controllers/patient');

router.post('/signup', patient.signup);
router.post('/login', patient.login);
router.put('/:patientId', patient.editPatientDetails);
router.post('/request/:doctorId', patient.requestDoctor);

module.exports = router;

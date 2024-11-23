const express = require('express');
const router = express.Router();
const hospital = require('../controllers/hospital');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', hospital.getAllHospitals);
router.get('/:hospitalId', authMiddleware, hospital.getHospitalById);
router.get('/:hospitalId/doctors', authMiddleware, hospital.getDoctorsInHospital);
router.get('/city/:city', authMiddleware, hospital.getHospitalsByCity);

module.exports = router;

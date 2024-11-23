const express = require('express');
const router = express.Router();
const admin = require('../controllers/admin');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', admin.signup);
router.post('/login', admin.login);
router.post('/hospital', authMiddleware, admin.addHospital);
router.get('/doctors', authMiddleware, admin.getAllDoctors);
router.put('/hospital/:hospitalId', authMiddleware, admin.editHospital);
router.delete('/hospital/:hospitalId', authMiddleware, admin.deleteHospital);
router.post('/hospital/doctor', authMiddleware, admin.addDoctorToHospital);
router.delete('/hospital/doctor', authMiddleware, admin.removeDoctorFromHospital);
router.get('/exists', admin.adminExists);

module.exports = router;

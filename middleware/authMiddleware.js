// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin'); // Adjust the path as necessary

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : null;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Admin.findById(decoded.adminId).select('+isAdmin');

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate as an admin' });
  }
};

module.exports = authMiddleware;

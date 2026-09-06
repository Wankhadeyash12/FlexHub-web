const jwt = require('jsonwebtoken');

<<<<<<< HEAD
const jwtSecret = process.env.JWT_SECRET || 'dev_flexhub_jwt_secret_change_me';

=======
>>>>>>> 71867d3cf50f05bb533d8b39897b37395560e685
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
<<<<<<< HEAD
    const decoded = jwt.verify(token, jwtSecret);
=======
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
>>>>>>> 71867d3cf50f05bb533d8b39897b37395560e685
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;

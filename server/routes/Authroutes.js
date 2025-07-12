const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const { signup, signin, checkEmail } = require('../controllers/authController');
const { validateSignup, validateSignin } = require('../middleware/validationMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  console.log('Google OAuth initiated');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  console.log('Google OAuth callback received');
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  })(req, res, next);
}, (req, res) => {
  try {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Google OAuth successful, redirecting to:', `${process.env.CLIENT_URL}/auth-success?token=${token}`);
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_failed`);
  }
});

// GitHub OAuth routes
router.get('/github', (req, res, next) => {
  console.log('GitHub OAuth initiated');
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
  console.log('GitHub OAuth callback received');
  passport.authenticate('github', {
    failureRedirect: '/login',
    session: false
  })(req, res, next);
}, (req, res) => {
  try {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('GitHub OAuth successful, redirecting to:', `${process.env.CLIENT_URL}/auth-success?token=${token}`);
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_failed`);
  }
});

// LinkedIn OAuth routes
router.get('/linkedin', (req, res, next) => {
  console.log('LinkedIn OAuth initiated');
  passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile'] })(req, res, next);
});

router.get('/linkedin/callback', (req, res, next) => {
  console.log('LinkedIn OAuth callback received');
  passport.authenticate('linkedin', {
    failureRedirect: '/login',
    session: false
  })(req, res, next);
}, (req, res) => {
  try {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('LinkedIn OAuth successful, redirecting to:', `${process.env.CLIENT_URL}/auth-success?token=${token}`);
    res.redirect(`${process.env.CLIENT_URL}/auth-success?token=${token}`);
  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/signin?error=oauth_failed`);
  }
});

// Traditional authentication routes
router.post('/signup', validateSignup, signup);
router.post('/signin', validateSignin, signin);
router.get('/check-email/:email', checkEmail);

// Get current user
router.get('/me', verifyToken, (req, res) => {
  res.json(req.user);
});

// Update user profile
router.put('/profile', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    // Handle avatar upload
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // Update user in database
    const User = require('../models/User');
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;

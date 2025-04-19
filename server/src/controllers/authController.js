const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, recoveryPhrase } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with that email or username' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,  // Will be hashed by the pre-save hook
      recoveryPhrase
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Recovery using phrase
exports.recover = async (req, res) => {
  try {
    const { email, recoveryPhrase, newPassword } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify recovery phrase
    if (user.recoveryPhrase !== recoveryPhrase) {
      return res.status(401).json({ message: 'Invalid recovery phrase' });
    }

    // Update password
    user.password = newPassword;
    await user.save();  // This will hash the new password

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Recovery error:', error);
    res.status(500).json({ message: 'Server error during recovery' });
  }
};

// Get current user from token
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -recoveryPhrase');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
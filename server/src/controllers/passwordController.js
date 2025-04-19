const Password = require('../models/Password');
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all passwords for a user
exports.getPasswords = async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.userId });
    res.status(200).json(passwords);
  } catch (error) {
    console.error('Get passwords error:', error);
    res.status(500).json({ message: 'Server error while retrieving passwords' });
  }
};

// Add a new password
exports.addPassword = async (req, res) => {
  try {
    const { url, username, password, name, category, notes, favorite } = req.body;

    const newPassword = new Password({
      userId: req.userId,
      url,
      username,
      password,  // Should be encrypted on client-side
      name,
      category,
      notes,
      favorite
    });

    await newPassword.save();
    res.status(201).json(newPassword);
  } catch (error) {
    console.error('Add password error:', error);
    res.status(500).json({ message: 'Server error while adding password' });
  }
};

// Update an existing password
exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, username, password, name, category, notes, favorite } = req.body;
    
    // Verify ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid password ID format' });
    }

    // Find password and verify ownership
    const existingPassword = await Password.findById(id);
    if (!existingPassword) {
      return res.status(404).json({ message: 'Password not found' });
    }

    // Ensure user owns this password
    if (existingPassword.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access to this password' });
    }

    // Update the password
    const updatedPassword = await Password.findByIdAndUpdate(
      id, 
      {
        url,
        username,
        password,  // Should be encrypted on client-side
        name,
        category,
        notes,
        favorite,
        updatedAt: Date.now()
      }, 
      { new: true }
    );

    res.status(200).json(updatedPassword);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error while updating password' });
  }
};

// Delete a password
exports.deletePassword = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid password ID format' });
    }

    // Find password and verify ownership
    const existingPassword = await Password.findById(id);
    if (!existingPassword) {
      return res.status(404).json({ message: 'Password not found' });
    }

    // Ensure user owns this password
    if (existingPassword.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access to this password' });
    }

    // Delete the password
    await Password.findByIdAndDelete(id);
    res.status(200).json({ message: 'Password deleted successfully' });
  } catch (error) {
    console.error('Delete password error:', error);
    res.status(500).json({ message: 'Server error while deleting password' });
  }
};

// Delete all passwords for a user - used for account reset
exports.deleteAllUserPasswords = async (req, res) => {
  try {
    const { password } = req.body;
    
    // Verify the user's password before deleting all passwords
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    // Delete all passwords for this user
    const result = await Password.deleteMany({ userId: req.userId });
    
    res.status(200).json({ 
      message: 'All passwords deleted successfully',
      count: result.deletedCount 
    });
  } catch (error) {
    console.error('Delete all passwords error:', error);
    res.status(500).json({ message: 'Server error while deleting passwords' });
  }
};

// Search passwords by query
exports.searchPasswords = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return await this.getPasswords(req, res);
    }

    const passwords = await Password.find({
      userId: req.userId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { url: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } }
      ]
    });

    res.status(200).json(passwords);
  } catch (error) {
    console.error('Search passwords error:', error);
    res.status(500).json({ message: 'Server error while searching passwords' });
  }
};

// Filter passwords by category
exports.filterByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      return await this.getPasswords(req, res);
    }

    const passwords = await Password.find({
      userId: req.userId,
      category
    });

    res.status(200).json(passwords);
  } catch (error) {
    console.error('Filter passwords error:', error);
    res.status(500).json({ message: 'Server error while filtering passwords' });
  }
};
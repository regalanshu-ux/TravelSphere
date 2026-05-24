const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const mockDb = require('../utils/mockDb');
const { authenticate, authorize } = require('../middleware/auth');

// Get current user's profile
router.get('/me', authenticate, async (req, res) => {
  res.json(req.user);
});

// Update preferences
router.put('/me/preferences', authenticate, async (req, res) => {
  const prefs = req.body;

  if (mongoose.connection.readyState !== 1) {
    try {
      const updatedUser = await mockDb.updateUserPreferences(req.user._id, prefs);
      if(!updatedUser) return res.status(404).json({message:'User not found'});
      return res.json(updatedUser.preferences);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try{
    req.user.preferences = Object.assign({}, req.user.preferences, prefs);
    await req.user.save();
    res.json(req.user.preferences);
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Admin: list users
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const usersList = mockDb.users.map(u => {
        const { password, ...rest } = u;
        return rest;
      });
      return res.json(usersList);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch(err) {
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

module.exports = router;

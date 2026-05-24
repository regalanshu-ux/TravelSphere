const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const mockDb = require('../utils/mockDb');

function signToken(user){
  const payload = { id: user._id, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
}

// Register (email/password)
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  if (mongoose.connection.readyState !== 1) {
    try{
      if(!email || !password) return res.status(400).json({message:'Email and password required'});
      let user = await mockDb.getUserByEmail(email);
      if(user) return res.status(400).json({message:'User exists'});
      user = await mockDb.createUser({ name, email, password, phone });
      const token = signToken(user);
      res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
    }catch(err){
      console.error(err);
      res.status(500).json({message:'Server error'});
    }
    return;
  }

  try{
    if(!email || !password) return res.status(400).json({message:'Email and password required'});
    let user = await User.findOne({ email });
    if(user) return res.status(400).json({message:'User exists'});
    const hash = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hash, phone });
    await user.save();
    const token = signToken(user);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Login (email/password)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (mongoose.connection.readyState !== 1) {
    try{
      const user = await mockDb.getUserByEmail(email);
      if(!user) return res.status(400).json({message:'Invalid credentials'});
      const match = await bcrypt.compare(password, user.password || '');
      if(!match) return res.status(400).json({message:'Invalid credentials'});
      const token = signToken(user);
      res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
    }catch(err){
      console.error(err);
      res.status(500).json({message:'Server error'});
    }
    return;
  }

  try{
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({message:'Invalid credentials'});
    const match = await bcrypt.compare(password, user.password || '');
    if(!match) return res.status(400).json({message:'Invalid credentials'});
    const token = signToken(user);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Phone OTP send (development mock)
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if(!phone) return res.status(400).json({message:'Phone required'});

  if (mongoose.connection.readyState !== 1) {
    try{
      let user = await mockDb.getUserByPhone(phone);
      if(!user){
        user = await mockDb.createUser({ phone });
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = { code, expiresAt: new Date(Date.now() + 5*60*1000) };
      res.json({ message: 'OTP sent (dev)', code });
    }catch(err){
      console.error(err);
      res.status(500).json({message:'Server error'});
    }
    return;
  }

  try{
    let user = await User.findOne({ phone });
    if(!user){
      user = new User({ phone });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = { code, expiresAt: new Date(Date.now() + 5*60*1000) };
    await user.save();
    res.json({ message: 'OTP sent (dev)', code });
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { phone, code } = req.body;
  if(!phone || !code) return res.status(400).json({message:'Phone and code required'});

  if (mongoose.connection.readyState !== 1) {
    try{
      const user = await mockDb.getUserByPhone(phone);
      if(!user || !user.otp) return res.status(400).json({message:'Invalid OTP'});
      if(user.otp.expiresAt < new Date()) return res.status(400).json({message:'OTP expired'});
      if(user.otp.code !== code) return res.status(400).json({message:'Invalid OTP'});
      user.otp = undefined;
      const token = signToken(user);
      res.json({ token, user: { id: user._id, phone: user.phone, role: user.role } });
    }catch(err){
      console.error(err);
      res.status(500).json({message:'Server error'});
    }
    return;
  }

  try{
    const user = await User.findOne({ phone });
    if(!user || !user.otp) return res.status(400).json({message:'Invalid OTP'});
    if(user.otp.expiresAt < new Date()) return res.status(400).json({message:'OTP expired'});
    if(user.otp.code !== code) return res.status(400).json({message:'Invalid OTP'});
    user.otp = undefined;
    await user.save();
    const token = signToken(user);
    res.json({ token, user: { id: user._id, phone: user.phone, role: user.role } });
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Google OAuth placeholder
router.get('/google', (req, res) => {
  res.json({ message: 'Google OAuth flow should be implemented with passport and proper credentials.' });
});

module.exports = router;

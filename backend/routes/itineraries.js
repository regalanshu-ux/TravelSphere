const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Itinerary = require('../models/Itinerary');
const mockDb = require('../utils/mockDb');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

// Create itinerary
router.post('/', authenticate, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const body = {
        ...req.body,
        owner: req.user._id,
        sharedToken: crypto.randomBytes(12).toString('hex')
      };
      const it = await mockDb.createItinerary(body);
      return res.json(it);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try{
    const it = new Itinerary(req.body);
    it.owner = req.user._id;
    it.sharedToken = crypto.randomBytes(12).toString('hex');
    await it.save();
    res.json(it);
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Get by id (owner or collaborator or public)
router.get('/:id', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const it = await mockDb.getItineraryById(req.params.id);
      if(!it) return res.status(404).json({message:'Not found'});
      return res.json(it);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try{
    const it = await Itinerary.findById(req.params.id).populate('owner').populate('collaborators');
    if(!it) return res.status(404).json({message:'Not found'});
    res.json(it);
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Update (owner or collaborator)
router.put('/:id', authenticate, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const it = await mockDb.getItineraryById(req.params.id);
      if(!it) return res.status(404).json({message:'Not found'});
      const ownerId = it.owner._id || it.owner;
      const allowed = ownerId === req.user._id || (it.collaborators || []).some(c => (c._id || c) === req.user._id) || req.user.role === 'admin';
      if(!allowed) return res.status(403).json({message:'Forbidden'});
      const updated = await mockDb.updateItinerary(req.params.id, req.body);
      return res.json(updated);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try{
    const it = await Itinerary.findById(req.params.id);
    if(!it) return res.status(404).json({message:'Not found'});
    const allowed = it.owner.equals(req.user._id) || (it.collaborators || []).some(c => c.equals(req.user._id)) || req.user.role === 'admin';
    if(!allowed) return res.status(403).json({message:'Forbidden'});
    Object.assign(it, req.body);
    await it.save();
    res.json(it);
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Share via token
router.get('/share/token/:token', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const it = await mockDb.getItineraryByToken(req.params.token);
      if(!it) return res.status(404).json({message:'Not found'});
      return res.json(it);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try{
    const it = await Itinerary.findOne({ sharedToken: req.params.token });
    if(!it) return res.status(404).json({message:'Not found'});
    res.json(it);
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Generate export placeholder
router.get('/:id/export/pdf', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const it = await mockDb.getItineraryById(req.params.id);
      if(!it) return res.status(404).json({message:'Not found'});
      return res.json({ message: 'PDF export placeholder', itinerary: it });
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try{
    const it = await Itinerary.findById(req.params.id);
    if(!it) return res.status(404).json({message:'Not found'});
    res.json({ message: 'PDF export placeholder', itinerary: it });
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

module.exports = router;

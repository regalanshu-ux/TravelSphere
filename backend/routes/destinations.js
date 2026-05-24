const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Destination = require('../models/Destination');
const mockDb = require('../utils/mockDb');
const { authenticate, authorize } = require('../middleware/auth');

// List + filter
router.get('/', async (req, res) => {
  const { q, tag, category } = req.query;

  if (mongoose.connection.readyState !== 1) {
    try {
      const list = await mockDb.getDestinations({ q, tag, category });
      return res.json(list);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try {
    const filter = {};
    if(q) filter.$text = { $search: q };
    if(tag) filter.tags = tag;
    if(category) filter.category = category;
    const list = await Destination.find(filter).limit(100);
    res.json(list);
  } catch(err) {
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Get by id
router.get('/:id', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const dest = await mockDb.getDestinationById(req.params.id);
      if(!dest) return res.status(404).json({message:'Not found'});
      return res.json(dest);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try {
    const dest = await Destination.findById(req.params.id);
    if(!dest) return res.status(404).json({message:'Not found'});
    res.json(dest);
  } catch(err) {
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Admin create
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const dest = await mockDb.createDestination(req.body);
      return res.json(dest);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try{
    const dest = new Destination(req.body);
    await dest.save();
    res.json(dest);
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Admin update
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const dest = await mockDb.updateDestination(req.params.id, req.body);
      if(!dest) return res.status(404).json({message:'Not found'});
      return res.json(dest);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try{
    const dest = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(dest);
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Admin delete
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const success = await mockDb.deleteDestination(req.params.id);
      if(!success) return res.status(404).json({message:'Not found'});
      return res.json({message:'Deleted'});
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try{
    await Destination.findByIdAndDelete(req.params.id);
    res.json({message:'Deleted'});
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

module.exports = router;

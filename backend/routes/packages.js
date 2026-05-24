const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Package = require('../models/Package');
const mockDb = require('../utils/mockDb');
const { authenticate, authorize } = require('../middleware/auth');

// List packages
router.get('/', async (req, res) => {
  const { q, category, tag } = req.query;

  if (mongoose.connection.readyState !== 1) {
    try {
      const list = await mockDb.getPackages({ q, category, tag });
      return res.json(list);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try {
    const filter = {};
    if(category) filter.category = category;
    if(tag) filter.tags = tag;
    if(q) filter.$text = { $search: q };
    const list = await Package.find(filter).populate('destination').limit(100);
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
      const pack = await mockDb.getPackageById(req.params.id);
      if(!pack) return res.status(404).json({message:'Not found'});
      return res.json(pack);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try {
    const pack = await Package.findById(req.params.id).populate('destination');
    if(!pack) return res.status(404).json({message:'Not found'});
    res.json(pack);
  } catch(err) {
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Create (agent/admin)
router.post('/', authenticate, authorize(['admin','agent']), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const body = { ...req.body, createdBy: req.user._id };
      if(!body.slug && body.title) body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
      const p = await mockDb.createPackage(body);
      return res.json(p);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try{
    const p = new Package(req.body);
    p.createdBy = req.user._id;
    if(!p.slug) p.slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    await p.save();
    res.json(p);
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Update (agent/admin)
router.put('/:id', authenticate, authorize(['admin','agent']), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const pack = await mockDb.updatePackage(req.params.id, req.body);
      if(!pack) return res.status(404).json({message:'Not found'});
      return res.json(pack);
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try{
    const pack = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(pack);
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// Delete (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      const success = await mockDb.deletePackage(req.params.id);
      if(!success) return res.status(404).json({message:'Not found'});
      return res.json({message:'Deleted'});
    } catch(err) {
      console.error(err);
      return res.status(500).json({message:'Server error'});
    }
  }

  try{
    await Package.findByIdAndDelete(req.params.id);
    res.json({message:'Deleted'});
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

module.exports = router;

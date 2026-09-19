const express = require('express');
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req,res) => {
  try {
    const q = {};
    if (req.query.location) q.location = { $regex: req.query.location, $options: 'i' };
    if (req.query.type) q.type = req.query.type;
    if (req.query.maxPrice) q.price = { $lte: Number(req.query.maxPrice) };
    if (req.query.status !== 'all') q.status = 'available';
    const docs = await Vehicle.find(q).sort({ createdAt: -1 }).lean();
    res.json(docs.map(v => ({...v, id: v._id.toString(), ownerId: v.ownerId?.toString()})));
  } catch(e){ res.status(500).json({message:e.message}); }
});

router.get('/mine', requireAuth, requireRole('owner','admin'), async (req,res) => {
  const q = req.user.role === 'admin' ? {} : { ownerId: req.user._id };
  const docs = await Vehicle.find(q).sort({createdAt:-1}).lean();
  res.json(docs.map(v=>({...v,id:v._id.toString(),ownerId:v.ownerId.toString()})));
});

router.get('/earnings', requireAuth, requireRole('owner','admin'), async (req,res) => {
  try {
    const q = req.user.role === 'admin' ? {} : { ownerId: req.user._id };
    const vehicles = await Vehicle.find(q).lean();
    const vehicleIds = vehicles.map(v => v._id);
    const bookings = await Booking.find({
      vehicleId: { $in: vehicleIds },
      status: { $in: ['confirmed', 'completed'] }
    }).lean();
    const totalEarnings = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const perVehicle = {};
    for (const v of vehicles) perVehicle[v._id.toString()] = 0;
    for (const b of bookings) {
      const vid = b.vehicleId.toString();
      if (perVehicle[vid] !== undefined) perVehicle[vid] += b.totalAmount || 0;
    }
    res.json({ totalEarnings, perVehicle, bookingCount: bookings.length });
  } catch(e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', async (req,res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message:'Invalid vehicle id.'});
  const v = await Vehicle.findById(req.params.id).lean();
  if (!v) return res.status(404).json({message:'Vehicle not found.'});
  res.json({...v,id:v._id.toString(),ownerId:v.ownerId.toString()});
});

router.post('/', requireAuth, requireRole('owner','admin'), async (req,res) => {
  try {
    const b=req.body;
    const v=await Vehicle.create({
      ownerId:req.user._id, name:b.name, type:b.type, location:b.location, price:Number(b.price),
      availableFrom:b.available || undefined, numberPlate:b.numberPlate,
      ownershipPaper:b.ownershipPaper, insurance:b.insurance, puc:b.puc,
      vehiclePicture:b.vehiclePicture, image:b.image || '', verified:false, status:'available'
    });
    res.status(201).json({...v.toObject(),id:v._id.toString(),ownerId:v.ownerId.toString()});
  } catch(e){res.status(400).json({message:e.message});}
});

router.put('/:id', requireAuth, requireRole('owner','admin'), async (req,res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message:'Invalid vehicle id.'});
  const q = req.user.role === 'admin' ? {_id:req.params.id} : {_id:req.params.id, ownerId:req.user._id};
  const v=await Vehicle.findOneAndUpdate(q,req.body,{new:true,runValidators:true}).lean();
  if(!v)return res.status(404).json({message:'Vehicle not found or not owned by you.'});
  res.json({...v,id:v._id.toString(),ownerId:v.ownerId.toString()});
});

router.delete('/:id', requireAuth, requireRole('owner','admin'), async (req,res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message:'Invalid vehicle id.'});
  const q = req.user.role === 'admin' ? {_id:req.params.id} : {_id:req.params.id, ownerId:req.user._id};
  const v=await Vehicle.findOneAndDelete(q);
  if(!v)return res.status(404).json({message:'Vehicle not found or not owned by you.'});
  res.json({message:'Vehicle deleted.'});
});

module.exports=router;

const express = require('express');
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

const demoImages = [
 'https://dukaan.b-cdn.net/700x700/webp/media/257922e3-935a-42b9-8074-dc86daac2d84.jpeg',
 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80',
 'https://images10.gaadi.com/usedcar_image/BP2A.250605.031.A3/original/37e4c941-b5e9-4d07-bc3d-04100fbc6546.jpg'
];

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
      vehiclePicture:b.vehiclePicture, image:b.image || demoImages[0], verified:false, status:'available'
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

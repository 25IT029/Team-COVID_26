const express = require('express');
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Agreement = require('../models/Agreement');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

router.post('/', requireAuth, async (req,res)=>{
  try {
    const {vehicleId,startDate,endDate,estimatedKm=0}=req.body;
    if(!mongoose.isValidObjectId(vehicleId)) return res.status(400).json({message:'Valid vehicleId is required.'});
    const start=new Date(startDate), end=new Date(endDate);
    if(Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end<=start) return res.status(400).json({message:'Valid start and end dates are required.'});
    const vehicle=await Vehicle.findById(vehicleId);
    if(!vehicle || vehicle.status!=='available') return res.status(404).json({message:'Vehicle is not available.'});

    const overlap=await Booking.findOne({
      vehicleId, status:{ $in:['pending','confirmed'] },
      startDate:{ $lt:end }, endDate:{ $gt:start }
    });
    if(overlap) return res.status(409).json({message:'Vehicle is already booked for part of this time.'});

    const hours=Math.max(1,Math.ceil((end-start)/3600000));
    const km=Number(estimatedKm)||0;
    const extraKm=hours>=24 ? Math.max(0,km-300) : 0;
    const total=hours*vehicle.price + extraKm*10;
    const booking=await Booking.create({
      userId:req.user._id,vehicleId,startDate:start,endDate:end,estimatedKm:km,hours,totalAmount:total,status:'confirmed'
    });
    const populated=await booking.populate('vehicleId','name type location price image');
    res.status(201).json({...populated.toObject(),id:booking._id.toString()});
  } catch(e){res.status(400).json({message:e.message});}
});

router.get('/my', requireAuth, async(req,res)=>{
  const docs=await Booking.find({userId:req.user._id}).populate('vehicleId','name type location image price').sort({createdAt:-1}).lean();
  res.json(docs.map(b=>({...b,id:b._id.toString(),userId:b.userId.toString(),vehicleId:b.vehicleId?b.vehicleId._id.toString():null})));
});

router.get('/:id', requireAuth, async(req,res)=>{
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Invalid booking id.'});
  const b=await Booking.findById(req.params.id).populate('vehicleId').lean();
  if(!b)return res.status(404).json({message:'Booking not found.'});
  if(req.user.role!=='admin' && b.userId.toString()!==req.user._id.toString())return res.status(403).json({message:'Not allowed.'});
  res.json({...b,id:b._id.toString()});
});

router.post('/:id/payment-demo', requireAuth, async(req,res)=>{
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Invalid booking id.'});
  const b=await Booking.findOneAndUpdate({_id:req.params.id,userId:req.user._id},{paymentStatus:'paid'},{new:true});
  if(!b)return res.status(404).json({message:'Booking not found.'});
  res.json({success:true,message:'Demo payment successful.',paymentStatus:b.paymentStatus});
});

router.post('/:id/agreement', requireAuth, async(req,res)=>{
  if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Invalid booking id.'});
  const b=await Booking.findOne({_id:req.params.id,userId:req.user._id});
  if(!b)return res.status(404).json({message:'Booking not found.'});
  const a=await Agreement.findOneAndUpdate({bookingId:b._id},{bookingId:b._id,acceptedByUser:true,acceptedAt:new Date(),termsVersion:'v1'},{upsert:true,new:true});
  res.json(a);
});

module.exports=router;

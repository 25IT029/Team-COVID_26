const express=require('express');
const Vehicle=require('../models/Vehicle');
const Booking=require('../models/Booking');
const User=require('../models/User');
const Ride=require('../models/Ride');
const {requireAuth,requireRole}=require('../middleware/auth');
const router=express.Router();

router.get('/summary',requireAuth,requireRole('admin'),async(req,res)=>{
  const [users,owners,vehicles,bookings,rides,pending]=await Promise.all([
    User.countDocuments(),User.countDocuments({role:'owner'}),Vehicle.countDocuments(),
    Booking.countDocuments(),Ride.countDocuments(),Vehicle.countDocuments({verified:false})
  ]);
  res.json({users,owners,vehicles,bookings,rides,pendingVehicleVerification:pending});
});
router.patch('/vehicles/:id/verify',requireAuth,requireRole('admin'),async(req,res)=>{
  const v=await Vehicle.findByIdAndUpdate(req.params.id,{verified:Boolean(req.body.verified),status:req.body.verified?'available':'pending'},{new:true});
  if(!v)return res.status(404).json({message:'Vehicle not found.'});
  res.json(v);
});
module.exports=router;

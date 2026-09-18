const express = require('express');
const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const { requireAuth } = require('../middleware/auth');
const router=express.Router();

router.get('/', async(req,res)=>{
  const q={};
  if(req.query.from)q.from={$regex:req.query.from,$options:'i'};
  if(req.query.to)q.to={$regex:req.query.to,$options:'i'};
  if(req.query.date){const d=new Date(req.query.date);if(!Number.isNaN(d.getTime())){const next=new Date(d);next.setDate(next.getDate()+1);q.date={$gte:d,$lt:next};}}
  const docs=await Ride.find(q).sort({date:1,time:1}).lean();
  res.json(docs.map(r=>({...r,id:r._id.toString(),driverId:r.driverId?.toString()})));
});

router.post('/', requireAuth, async(req,res)=>{
  try{
    const r=await Ride.create({...req.body,driverId:req.user._id,driver:req.user.name,date:new Date(req.body.date)});
    res.status(201).json({...r.toObject(),id:r._id.toString()});
  }catch(e){res.status(400).json({message:e.message});}
});
module.exports=router;

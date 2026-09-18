const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const User=require('./models/User');
const Vehicle=require('./models/Vehicle');
const Ride=require('./models/Ride');

const demo=[
 {name:'Honda Activa',type:'Scooter',location:'Vesu, Surat',price:80,rating:4.7,image:'https://dukaan.b-cdn.net/700x700/webp/media/257922e3-935a-42b9-8074-dc86daac2d84.jpeg'},
 {name:'Yamaha FZ',type:'Bike',location:'Adajan, Surat',price:100,rating:4.8,image:'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80'},
 {name:'Tata Tiago EV',type:'Car',location:'Citylight, Surat',price:240,rating:4.9,image:'https://images10.gaadi.com/usedcar_image/BP2A.250605.031.A3/original/37e4c941-b5e9-4d07-bc3d-04100fbc6546.jpg'},
 {name:'Ather 450X',type:'Scooter',location:'Piplod, Surat',price:95,rating:4.6,image:'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80'},
 {name:'TVS Raider',type:'Bike',location:'Vesu, Surat',price:90,rating:4.5,image:'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80'},
 {name:'Hyundai i20',type:'Car',location:'Athwa, Surat',price:280,rating:4.8,image:'https://img.autotrader.co.za/812745/Crop860x650'}
];
(async()=>{
 await mongoose.connect(process.env.MONGODB_URI);
 let owner=await User.findOne({email:'demo.owner@vroomy.local'});
 if(!owner) owner=await User.create({name:'VROOMY Demo Owner',email:'demo.owner@vroomy.local',phone:'9999999999',passwordHash:await bcrypt.hash('Demo@12345',10),role:'owner',isVerified:true});
 const count=await Vehicle.countDocuments({ownerId:owner._id});
 if(!count) await Vehicle.insertMany(demo.map(v=>({...v,ownerId:owner._id,verified:true,status:'available'})));
 const rideCount=await Ride.countDocuments();
 if(!rideCount) await Ride.insertMany([
  {driverId:owner._id,driver:'Rahul Patel',from:'Surat',to:'Ahmedabad',date:new Date('2026-09-20'),time:'08:00',seats:2,price:300,rating:4.8,vehicle:'Hyundai Creta'},
  {driverId:owner._id,driver:'Jay Shah',from:'Surat',to:'Ahmedabad',date:new Date('2026-09-20'),time:'09:00',seats:1,price:280,rating:4.7,vehicle:'Maruti Baleno'},
  {driverId:owner._id,driver:'Priya Mehta',from:'Surat',to:'Vadodara',date:new Date('2026-09-21'),time:'07:30',seats:3,price:190,rating:4.9,vehicle:'Honda City'}
 ]);
 console.log('Demo data ready.');
 console.log('Demo owner login: demo.owner@vroomy.local / Demo@12345');
 await mongoose.disconnect();
})().catch(e=>{console.error(e);process.exit(1)});

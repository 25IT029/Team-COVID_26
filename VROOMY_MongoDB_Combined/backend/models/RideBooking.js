const mongoose=require('mongoose');
const rideBookingSchema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
 rideId:{type:mongoose.Schema.Types.ObjectId,ref:'Ride',required:true,index:true},
 seats:{type:Number,required:true,min:1,max:6}, totalAmount:{type:Number,required:true,min:0},
 commissionRate:{type:Number,default:10,min:0,max:100}, platformCommission:{type:Number,default:0,min:0}, driverEarning:{type:Number,default:0,min:0},
 paymentMethod:{type:String,enum:['demo'],default:'demo'},paymentReference:{type:String,index:true,sparse:true},
 status:{type:String,enum:['payment_pending','confirmed','cancelled','completed'],default:'payment_pending'},
 paymentStatus:{type:String,enum:['pending','paid','failed','refunded'],default:'pending'},
 cancelledBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},cancelReason:{type:String,trim:true},refundAmount:{type:Number,default:0,min:0}
},{timestamps:true});
module.exports=mongoose.model('RideBooking',rideBookingSchema);

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const couponSchema = new Schema({
  title:{
    type: String,
    required: true,
  },
  couponCode: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  expiryDate:{
    type: Date,
    require:true
  },
  minPurchaseAmount : {
    type:Number,
    require:true
  },
  status:{
    type : Boolean,
    default: true
  },
  maxDiscountAmount:{
    type:Number,
    require:true
  },
  users: [{ 
    
    type:Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const couponModel = mongoose.model('Coupon', couponSchema);

module.exports = couponModel;
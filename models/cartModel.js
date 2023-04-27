
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  productId:{
      type:Schema.Types.ObjectId,
      //  .poluplate('products')
      ref: 'Products',
  },
  quantity:{
      type:Number,
      required:true
  },
  size:{
    type:String,
    require:true
  },
  totalPrice:{
    type:Number,
    require:true ,
    default:0
  }
})
const cartSchema = new Schema({
  Products:[productSchema],
  UserId:{
      type:String,
      required:true
  },
  GrandTotal:{
    type:Number,
    required:true,
    default:0
  },
  discount:{
    type:Number,
    default:null
  },
  coupon:{
    type:Schema.Types.ObjectId,
    ref: 'Coupon'
  }
})
const cartModel = mongoose.model('Cart', cartSchema);

module.exports = cartModel 
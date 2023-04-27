const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Products',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    type: productSchema,
    required: true
  }],
  shippingAddress: {
    type: Object,
    required: true
  },
  orderDate: {
    type: Date,
    required: true
  },
  paymentType: {
    type: String,
    required: true
  },
  GrandTotal: {
    type: Number,
    required: true
  },
  discount:{
    type: Number,
    default:0
  },
  coupon:{
    type:Schema.Types.ObjectId,
    ref: 'Coupon',
    default:null
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Shipped', 'Delivered', 'Canceled', 'Returned'],
    default: 'Confirmed'
  },
  shippingDate: {
    type: Date,
    default: null
  },
  deliveredDate: {
    type: Date,
    default: null
  },
  orderCanceled: {
    type: Date,
    default: null
  },
  returnedDate: {
    type: Date,
    default: null
  }
});

const orderModel = mongoose.model('Order', orderSchema);

module.exports = orderModel
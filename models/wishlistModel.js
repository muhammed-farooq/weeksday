const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  productId:{
      type:Schema.Types.ObjectId,
      //  .poluplate('products')
      ref: 'Products',
  }
})
const wishlistSchema = new Schema({
  Products:[productSchema],
  UserId:{
      type:String,
      required:true
  }
})
const wishlistModel = mongoose.model('Wishlist', wishlistSchema);

module.exports = wishlistModel 
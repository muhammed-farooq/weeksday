const Admin = require ('../models/adminModel');
const User = require ('../models/userModel')
const Product = require ('../models/productModel')
const Category = require ('../models/categoryModel');
const Cart = require ('../models/cartModel')
const Wishlist = require ('../models/wishlistModel')
const Coupon = require ('../models/couponModel')




const cartLoad = async (req,res) => {
    try {
        const userData = await User.findOne({_id:req.session.user_Id});
        const carts = await Cart.findOne({UserId:req.session.user_Id})
        .populate('Products.productId')
        .populate('coupon');

        res.render('cart',{user:userData,carts})
    } catch (error) {
        console.log(error.message);
    }
}
let totalPrice = 0;
let grandTotal = 0; 

const addToCart = async (req,res) => {
    try {
        const userId = req.session.user_Id
        const size = req.body.size
        const quantity = req.body.quantity
        const productId = req.query.id    
        const product =  await Product.findById({_id:productId})
        const productPrice = product.price
        totalPrice = quantity*productPrice;
        const cart =  await Cart.findOne({UserId:userId})
        if(userId != null){
            if(Number(product.stocks) >= Number(quantity) ){
                if (cart) {
                    const index = cart.Products.findIndex(item => item.productId.equals(productId));
                    if (index === -1) {
                        cart.Products.push({ productId, quantity, size, totalPrice });
                        cart.GrandTotal += totalPrice ;
                        const UCart = await cart.save();
                        if (UCart) {
                            console.log('updated');
                            const responseData = {
                                success: true,
                                message: 'Product added to your Cart successfully'
                              };
                              res.send(responseData);
                        }else{
                            const responseData = {
                                success: true,
                                message: 'Product coudint add to your Cart '
                              };
                              res.send(responseData);
                        }
                    } else {
                        if (Number(product.stocks) >= Number(cart.Products[index].quantity)+ Number(quantity)) {
                            
                            const newQuantity = parseInt(cart.Products[index].quantity) + parseInt(quantity);
                            cart.Products[index].quantity =newQuantity;
                            cart.Products[index].totalPrice += productPrice * quantity;
                            cart.GrandTotal += productPrice * quantity;
                            const UCart = await cart.save();
                            if (UCart) {
                                console.log('updated welll');
                                const responseData = {
                                    success: true,
                                    message: 'Product added to your Cart successfully'
                                  };
                                  res.send(responseData);
                            }else{
                                const responseData = {
                                    success: true,
                                    message: 'Product coudint add to your Cart '
                                  };
                                  res.send(responseData);
                            }
                            
                        }else{
                            const responseData = {
                                success: true,
                                message: `sorry!,there is only this item ${product.stocks} availeble`
                              };
                              res.json(responseData);
                        }
                    }
                } else {
                    const newCart = await Cart({
                        UserId: userId,
                        GrandTotal: totalPrice,
                        Products: [{ productId, quantity, size, totalPrice }]
                    }).save();
                    if (newCart) {
                        console.log('saved');
                        const responseData = {
                            success: true,
                            message: 'Product added to your Cart successfully'
                          };
                          res.send(responseData);
                    }
                }
            }else{
            const responseData = {
                success: true,
                message: `sorry,there is only this item ${product.stocks} availeble`
              };
              res.send(responseData);
            }
        }else{
            mes = "first you need to login";
            const responseData = {
                success: false,
                message: `first you need to login`
              };
              res.send(responseData);
        }
        
    } catch (error) {
        console.log(error);
    }
}


const increamentCart = async (req,res) => {
    try {
        const userId = req.session.user_Id
        const productId = req.query.productId;
        const product =  await Product.findById({_id:productId})
        const productPrice = product.price
        const cart =  await Cart.findOne({UserId:userId})

        if (cart) {
            const index = cart.Products.findIndex(item => item.productId.equals(productId));
            if (index === -1) {
                return res.status(400).json({ error: 'Product not found in cart' });
            } else {
                const newPrice = parseInt(cart.Products[index].totalPrice) + parseInt(productPrice);
                const newGrandPrice = parseInt(cart.GrandTotal) + parseInt(productPrice);
                cart.Products[index].quantity++;
                cart.Products[index].totalPrice = newPrice;
                cart.GrandTotal = newGrandPrice;
            }
            const UCart = await cart.save();
            if (UCart) {
                let Grand
                if(cart.discount){

                    Grand = cart.GrandTotal - cart.discount
                }else{
                    Grand = cart.GrandTotal

                }
                return res.json({subGrand:cart.GrandTotal,total:cart.Products[index].totalPrice,grand:Grand});
            }else{
                return res.status(400).json({ error: 'couldnt update' });
            }
        } else {
            return res.status(400).json({ error: 'do not found  cart' });
        }
    } catch (error) {
        console.log(error);
    }
}


const decreamentCart = async (req,res) => {
    try {
        const userId = req.session.user_Id
        const productId = req.query.productId;
        const product =  await Product.findById({_id:productId})
        const productPrice = product.price
        const cart =  await Cart.findOne({UserId:userId})

        if (cart) {
            const index = cart.Products.findIndex(item => item.productId.equals(productId));
            if (index === -1) {
                return res.status(400).json({ error: 'Product not found in cart' });
            } else {
                if(cart.coupon)await Coupon.updateOne({ _id: cart.coupon },{ $pull: { users: cart.UserId } });   
                const newPrice = parseInt(cart.Products[index].totalPrice) - parseInt(productPrice);
                const newGrandPrice = parseInt(cart.GrandTotal) - parseInt(productPrice);
                cart.Products[index].quantity--;
                cart.Products[index].totalPrice = newPrice;
                cart.GrandTotal = newGrandPrice;
                cart.coupon = null;
                cart.discount = null;
            }
            const UCart = await cart.save();
            if (UCart) {
                let Grand
                if(cart.discount){
                    Grand = cart.GrandTotal - cart.discount
                }else{
                    Grand = cart.GrandTotal
                }
                return res.json({subGrand:cart.GrandTotal,total:cart.Products[index].totalPrice,grand:Grand});
            }else{
                return res.status(400).json({ error: 'couldnt update' });
            }
        } else {
            return res.status(400).json({ error: 'do not found  cart' });
        }
    } catch (error) {
        console.log(error);
    }
}

const removeCart = async (req,res) =>{
    try {
        const userId = req.session.user_Id
        const productId = req.query.productId;
        const cart =  await Cart.findOne({UserId:userId})
        if (cart) {
            const index = cart.Products.findIndex(item => item.productId.equals(productId));
            if (index === -1) {
                return res.status(400).json({ error: 'Product not found in cart' });
            } else {
                if(cart.coupon)await Coupon.updateOne({ _id: cart.coupon },{ $pull: { users: cart.UserId } });   
                const newGrandPrice = parseInt(cart.GrandTotal) - parseInt(cart.Products[index].totalPrice);
                cart.GrandTotal = newGrandPrice;
                cart.Products.splice(index, 1);
                cart.coupon = null;
                cart.discount = null;
            }
            const UCart = await cart.save();
            if (UCart) {
                const qua = cart.Products.length
                const  message = 'item removed from cart successfully'
                  return res.json({grand:cart.GrandTotal,message,qua});
            }else{
                res.redirect('/cart')
                return res.status(400).json({ error: 'couldnt update' });
            }
        } else {
            return res.status(400).json({ error: 'do not found  cart' });
        }
    } catch (error) {
        console.log(error);
    }
}


const WishlistLoad = async (req,res) => {
    try {
        const userData = await User.findOne({_id:req.session.user_Id});
        const wishlists = await Wishlist.findOne({UserId:req.session.user_Id}).populate('Products.productId')
        res.render('wishlist',{user:userData,wishlists})
    } catch (error) {
        console.log(error.message);
    }
}



const addToWishlist = async (req,res) => {
    try {
        const userId = req.session.user_Id
        const productId = req.query.id   
        const wishlist =  await Wishlist.findOne({UserId:userId})
        if(userId!=null){
            if(wishlist) {
                const index = wishlist.Products.findIndex(item => item.productId.equals(productId));
                if (index === -1) {
                    wishlist.Products.push({ productId });
                    const Uwishlist = await wishlist.save();
                    if (Uwishlist) {
                        console.log('updated');
                        const responseData = {
                            success: true,
                            message: 'Product added to wishlist successfully'
                          };
                          res.send(responseData);
                        // res.redirect(`/product-detail?id=${productId}`);
                    }
                } else {
                    const responseData = {
                        success: true,
                        message: 'Product already in your  wishlist'
                      };
                      res.send(responseData);
                }
    
            } else {
                console.log('hfgdhgdhgh');
                const newWishlist = await Wishlist({
                    UserId: userId,
                    Products: [{ productId }]
                }).save();
                if (newWishlist) {
                    const responseData = {
                        success: true,
                        message: 'Product added to wishlist successfully'
                      };
                      res.send(responseData);
                    // res.redirect(`/product-detail?id=${productId}`);
                }
            }
        }else{
            mes = 'first you need to login'
            const responseData = {
                success: false,
                message: 'first you need to login'
              };
              res.send(responseData);  
        }
    } catch (error) {
        console.log(error);
    }
}


const removeWishlist =async (req,res) =>{
    try {
        const userId = req.session.user_Id
        const productId = req.query.productId;
        const wishlist =  await Wishlist.findOne({UserId:userId})

        if (wishlist) {
            const index = wishlist.Products.findIndex(item => item.productId.equals(productId));
            console.log(index);
            if (index === -1) {
                return res.status(400).json({ error: 'Product not found in cart' });
            } else {
                console.log('mgk;gmn');
                wishlist.Products.splice(index, 1);
                const Uwishlist = await wishlist.save();
                if (Uwishlist) {
                    const responseData = {
                        success: true,
                        message: 'Product removed from wishlist successfully',
                        qua:wishlist.Products.length
                      };
                      res.send(responseData);
                }else{
                    return res.status(400).json({ error: 'couldnt update' });
                }
            }
        } else {
            return res.status(400).json({ error: 'do not found  wishlist' });
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    cartLoad,
    addToCart,
    increamentCart,
    decreamentCart,
    removeCart,
    WishlistLoad,
    addToWishlist,
    removeWishlist
}
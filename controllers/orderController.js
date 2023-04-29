const Admin = require ('../models/adminModel');
const User = require ('../models/userModel')
const Product = require ('../models/productModel')
const Category = require ('../models/categoryModel');
const Cart = require ('../models/cartModel')
const Wishlist = require ('../models/wishlistModel');
const Order = require("../models/orderModel");
const Razorpay = require ('razorpay');
const Coupon = require('../models/couponModel');

const instance = new Razorpay({
    key_id: "rzp_test_XAmcvH8COqaYws",
    key_secret: "L2bo4e5kg9SZPoZlvm5kH2pR"
})

let message;
let pro = [];

const addressLoad =async  (req,res) => {
    try {
        const userId = req.session.user_Id
        const userData = await User.findOne({_id:userId});
        res.render('address',{user:userData,message})
        message =null ;
    } catch (error) {
        console.log(error);
        
    }
}

const addAddressload =async (req,res) => {
    try {
        let index;
        if(!req.query.index){
            index = null
        }else{
            index = req.query.index
        }
        const userId = req.session.user_Id
        const userData = await User.findOne({_id:userId});
        res.render('add-address',{user:userData,index})
    } catch (error) {
        console.log(error);
    }
}

const addAddress = async (req,res) => {
    try {
        const userId = req.session.user_Id
        const {name,housename,pincode,city,district, state,mobilenumber,email} = req.body
        const user = await User.findOne({_id:userId})
        if (req.query.index) {
            const index= req.query.index
            user.addresses[index].name = name,
            user.addresses[index].houseName = housename,
            user.addresses[index].city = city,
            user.addresses[index].district = district,
            user.addresses[index].mobilNumber = mobilenumber,
            user.addresses[index].email = email,
            user.addresses[index].state = state,
            user.addresses[index].zip = pincode
            const User = await user.save();
            if (User) {
                message = 'adresss edited successfuly'
                res.redirect('/address')
            }else{
                message = 'cant adresss edit'
                res.redirect('/address')
            }
        }else{
            const userData = await User.updateOne({_id:userId},{$push:
                {addresses:{
                    name:name,
                    houseName:housename,
                    city:city,
                    district:district,
                    mobilNumber:mobilenumber,
                    email:email,
                    state:state,
                    zip:pincode
                }}});
            if (userData) {
                message = 'adresss added successfuly'
                res.redirect('/address')
            }
        }

    } catch (error) {
        console.log(error);
        
    }
}

const removeAddress = async (req,res) =>{
    try {
        const userId = req.session.user_Id
        const index= req.query.index
        const userData = await User.findOne({_id:userId});
        if (userData) {
            userData.addresses.splice(index, 1);
            const user = await userData.save();
            if (user) {
                const responseData = {
                    success: true,
                    message: 'address removed successfully'
                    };
                    res.send(responseData);
            }else{
                return res.status(400).json({ error: 'couldnt update' });
            }
        }
    } catch (error) {
        console.log(error);
        
    }
}

const checkoutLoad =async  (req,res) => {
    try {
        let index = 0
        
        if(req.query.index){   
            index = req.query.index
        }
        const userId = req.session.user_Id
        const userData = await User.findOne({_id:userId});
        let cart = await Cart.findOne({UserId:userId}).populate('Products.productId').populate('coupon');
        if(cart){
            if(cart.Products.length != 0){
                const outOfStock = cart.Products.map((value)=>value).filter((value)=>{
                    return value.productId.stocks >= value.quantity 
                })
                if(outOfStock.length != 0){
                    const coupon = await Coupon.find({ users: { $ne: userId } });
                    res.render('checkout',{user:userData,index,cart,coupon})
                }else{
                    res.redirect('/cart')
                }
            }else{
                res.redirect('/cart')
            }
        }else{
            res.redirect('/cart')
        }

    } catch (error) {
        console.log(error);     
    }
}
// const checkOut = async(req,res)=>{

//     try {

//         const session = req.session.user_id 
//         const cartData = await cartModel.findOne({user : session}).populate('item.product')

//         const user = await User.findOne({_id : session})

//         if(cartData){
//             const outOfStock = cartData.item.map((value)=>value).filter((value)=>{
//                 return value.product.stock < 1
//             })
//             if(outOfStock.length!=0){

//                 res.redirect('/view-cart')

//             }else{

//             const coupon = await couponModel.find({'users.user':{$ne:session}})
//             console.log(coupon);

//             console.log(discountField);
                
//             res.render('checkout',{session,cartData,user,coupon,discountField})

//             }

//         }else{

//             res.redirect('/view-cart')

//         }
//     } catch (error) {
//         console.log(error);
//     }
// }

const placeOrder = async (req, res) => {
    try {
      const { name, housename, pincode, city, district, state, mobilenumber, email,paymentType } = req.body;
      const userId = req.session.user_Id;
      const date = new Date()
      const cart = await Cart.findOne({ UserId: userId }).populate('Products.productId');
      
    //   Extract cart items and calculate the order total
      const orderItems = cart.Products.map(product => ({
        productId: product.productId._id,
        quantity: product.quantity,
        size: product.size,
        price: product.totalPrice,
      }));
      const orderTotal = cart.GrandTotal;
      const discount = cart.discount;
      const coupon = cart.coupon
      // Create the order object with the user, order items, shipping address, and status
      
      if (paymentType == 'cod'){
          console.log(orderItems);
          const order = new Order({
            user: userId,
            products: orderItems,
            shippingAddress: {
            name,
            housename,
            pincode,
            city,
            district,
            state,
            mobilenumber,
            email
            },
            status: 'Confirmed',
            orderDate:date,
            paymentType:paymentType,
            GrandTotal:orderTotal,
            discount:discount,
            coupon:coupon
        });
        

        await order.save();
        
        const updatePromises = orderItems.map(item => {
            const { productId, quantity } = item;
            return Product.findByIdAndUpdate({_id: productId}, { $inc: { stocks: -quantity } });
        });
        await Promise.all(updatePromises);
        await Cart.updateOne({ UserId: userId }, { $set: { Products: [], GrandTotal: 0 ,discount:0,coupon:null} });

          res.redirect(`/checkout-success?orderId=${order._id}`)
    }else if(paymentType == 'Razorpay'){
            // create a Razorpay order
            const options = {
                amount: Number(orderTotal-cart.discount) * 100, // amount in paisa (multiply by 100)
                currency: "INR", // currency code
                receipt: "order_" + date.getTime(), // unique order ID
            }
            const order = await instance.orders.create(options)
            req.session.order = order
            console.log(order,req.session.order);
            console.log('kftrhgdjhfghsdgdfjhg');
            req.session.orderData = {
                user: userId,
                products: orderItems,
                shippingAddress: {
                name,
                housename,
                pincode,
                city,
                district,
                state,
                mobilenumber,
                email
                },
                status: 'Confirmed',
                orderDate:date,
                paymentType:paymentType,
                GrandTotal:orderTotal,
                discount:discount,
                coupon:coupon
            }
            console.log(order.id,order);
          res.redirect(`/checkout-success?Id=${order.id}`)
        // res.status(201).json({ succsess:true, message: 'Order placed successfully!' ,paymentType:'Razorpay'});
    }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Failed to place order!' });
    }
  };

  const razorpay = async (req, res) => {
    
    const orderData = req.session.orderData
    const userId = req.session.user_Id
    const order = new Order({
        user: userId,
        products: orderData.products,
        shippingAddress: orderData.shippingAddress,
        orderDate:orderData.orderDate,
        paymentType:orderData.paymentType,
        GrandTotal:orderData.GrandTotal,
        discount:orderData.discount,
        coupon:orderData.coupon,
        status: 'Confirmed'
    });
    
        
        //   Save the order object in the collection
        const orderD = await order.save();
        
        const updatePromises = orderData.products.map(item => {
            const { productId, quantity } = item;
            return Product.findByIdAndUpdate({_id: productId}, { $inc: { stocks: -quantity } });
        });
        await Promise.all(updatePromises);

        // Clear the user's cart
        await Cart.updateOne({ UserId: userId }, { $set: { Products: [], GrandTotal: 0 ,discount:0,coupon:null} });
        req.session.orderData = null;
        req.session.order = null;
    res.json({orderId: order._id })


}


const myOrderLoad = async  (req,res) => {
    try {
        const userId = req.session.user_Id
        const userData = await User.findOne({_id:userId});
        const orders = await Order
        .find({ user: userId})
        .populate('products.productId')
        .sort({ _id: -1 });        
        res.render('my-order',{user:userData,orders})

    } catch (error) {
        console.log(error);     
    }
}


const checkoutSuccessload = async (req,res) => {
    try {
        const orderId = req.query.orderId
        const userId = req.session.user_Id
        const order = req.session.order
        console.log(!order);
        const userData = await User.findOne({_id:userId});
        // const order = await Order.findOne({user:userId,_id:orderId}).populate('products.productId');
        res.render('checkout-success',{user:userData,order,orderId})

    } catch (error) {
        console.log(error);     
    }
}

const orderDetails = async (req,res) => {
    try {
        const orderId = req.query.id
        const userId = req.session.user_Id
        const userData = await User.findOne({_id:userId});
        const order = await Order.findOne({user:userId,_id:orderId}).populate('products.productId');
        console.log(order);
        res.render('order-details',{user:userData,order})

    } catch (error) {
        console.log(error);     
    }
}

const orderShipped = async (req,res) => {
    try {
        const date =new Date()
        const orderId = req.query.orderId
        const order = await Order.findOne({ _id: orderId });
        if (order) {
            if (order.status != 'Shipped' && order.status === 'Confirmed'){
                order.status = "Shipped";
                order.shippingDate = date;
                
                const updatedOrder = await order.save();
    
                if (updatedOrder) {
                    const responseData = {
                    success: true,
                    message: "order shipped successfully"};
                    res.send(responseData);
                } else {
                    res.send({success: false,message: "Failed to update order status"});
                }
            }else{
                const responseData = {
                    success: false,
                    message: "product not found",
                  };
                  res.send(responseData);
            }
        } else {
          const responseData = {
            success: false,
            message: "Order not found",
          };
          res.send(responseData);
        }
    } catch (error) {
     console.log(error.message);
    }
}


const orderDelivery = async (req,res) => {
    try {
        const date = new Date()
        const orderId = req.query.orderId
        const order = await Order.findOne({ _id: orderId });
        if (order) {
            if (order.status != 'Delivered' && order.status === "Shipped"){
                order.status = "Delivered";
                order.deliveredDate = date

                const updatedOrder = await order.save();
    
                if (updatedOrder) {
                    const responseData = {
                    success: true,
                    message: "product Delivered successfully",

                    };
                    res.send(responseData);
                } else {
                    res.send({success: false,message: "Failed to update"});
                }
              }else{
                const responseData = {
                    success: false,
                    message: "product not found",
                  };
                  res.send(responseData);
              }
        } else {
          const responseData = {
            success: false,
            message: "Order not found",
          };
          res.send(responseData);
        }
    } catch (error) {
     console.log(error.message);
    }
}


const orderCanceled =async (req,res)=>{
    try {
        const date =new Date()
        const orderId = req.query.orderId
        const order = await Order.findOne({ _id: orderId });
        if (order) {
                if (order.status != 'Canceled' && order.status != 'Delivered'){
                    order.status = "Canceled";
                    order.orderCanceled = date;
                    if(order.paymentType == "Razorpay"){
                        await User.updateOne({ _id: order.user }, {$inc: { wallet: order.GrandTotal-order.discount }});
                    }
                    const updatedOrder = await order.save();
        
                    if (updatedOrder) {
                      const responseData = {
                        success: true,
                        message: "order cancelled successfully"};
                      res.send(responseData);
                    } else {
                      res.send({success: false,message: "Failed to update"});
                    }
                }else{
                    res.send({success: false,message: "somthing wrong"});
                }

        } else {
          const responseData = {
            success: false,
            message: "Order not found",
          };
          res.send(responseData);
        }
    } catch (error) {
     console.log(error.message);
    }
}

const orderReturn =async (req,res)=>{
    try {
        const date =new Date()
        const orderId = req.query.orderId
        const order = await Order.findOne({ _id: orderId });
        if (order) {
                if (order.status != 'Canceled' && order.status != 'Shipped'&& order.status != 'Confirmed'){
                    order.status = "Returned";
                    order.returnedDate = date;
                    await User.updateOne({ _id: order.user }, {$inc: { wallet: order.GrandTotal-order.discount }});
                    const updatedOrder = await order.save();

                    if (updatedOrder) {
                      const responseData = {
                        success: true,
                        message: "order return successfully, refund addto wallet"};
                      res.send(responseData);
                    } else {
                      res.send({success: false,message: "Failed to update"});
                    }
                }else{
                    res.send({success: false,message: "somthing wrong"});
                }
        } else {
          const responseData = {
            success: false,
            message: "Order not found",
          };
          res.send(responseData);
        }
    } catch (error) {
     console.log(error.message);
    }
}

const applyCoupon = async(req,res)=>{

    try {
        if(req.body.coupon){
            const userId = req.session.user_Id
            const couponId =  req.body.coupon

            const coupon = await Coupon.findOne({_id : couponId})
            const userCart = await Cart.findOne({UserId : userId})
                
            if (coupon) {
                if(userCart.coupon){
                    await Coupon.updateOne({ _id : userCart.coupon },{ $pull: { users: userCart.UserId }});
                }
                const index = coupon.users.findIndex(item => item.equals(userId));
                if(index == -1){
                    console.log(userCart,coupon);
                    const couponDiscount = (coupon.discount / 100)

    
                        if (userCart.GrandTotal >= coupon.minPurchaseAmount) {
    

                            const discount = coupon.discount ;

                            if (userCart.GrandTotal * couponDiscount > coupon.maxDiscountAmount) {
    
                                const grand = coupon.maxDiscountAmount
    
                                await Cart.updateOne({UserId:userId},{$set:{discount:grand,coupon:coupon._id}})
                                
                                await Coupon.updateOne({ _id: couponId },{ $push: { users: userCart.UserId }});

                                const grandTotal = userCart.GrandTotal - grand ;

                                res.send({sucsses:true,message:'coupon applyed successfully',discount:discount,grandTotal:grandTotal})
    
                            }else{
    
                                const grand = userCart.GrandTotal * couponDiscount
    
                                await Cart.updateOne({UserId:userId},{$set:{discount:grand,coupon:coupon._id}})
    
                                await Coupon.updateOne({ _id: couponId },{$push: { users:  userCart.UserId  }});

                                const grandTotal = userCart.GrandTotal - grand ;

                                res.send({sucsses:true,message:'coupon applyed successfully',discount:discount,grandTotal:grandTotal})
                        
                            }
                            
                        }else{
    
                            message = "minimum purchase not met"
    
                            console.log(message);
                            res.send({sucsses:false,message:'minimum purchase not met'})
                        }

            }else{
                res.send({sucsses:false,message:'you alredy use this coupon onces'})
            }                                  
        }else {
    
                message = "coupon expired or not valid"

                console.log(message);
                res.send({sucsses:false,message:'coupon expired or not valid'})
            }
    }else{
        res.send({sucsses:false,message:'coupon not fount'})

    }    
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    addressLoad,
    addAddressload,
    addAddress,
    removeAddress,
    checkoutLoad,
    placeOrder,
    razorpay,
    myOrderLoad,
    checkoutSuccessload,
    orderDetails,
    orderShipped,
    orderDelivery,
    orderCanceled,
    orderReturn,
    applyCoupon
}
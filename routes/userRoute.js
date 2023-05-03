const express = require("express");
const router = express();
const session = require ('express-session');
const config = require ('../config/config')


const auth = require ('../middleware/auth')

router.use(session({secret:config.sessionSecret}))
router.set ('view engine','ejs')
router.set ('views','./views/users')
const userController = require ('../controllers/userController');
const CartController = require ('../controllers/cart-wishlistController')
const orderController = require ('../controllers/orderController')


router.get('/register',auth.isLogout,userController.loadRegister).post('/register',userController.insertUser );
router.get('/',userController.loadHome );
router.route('/login').get(auth.isLogout,userController.loginLoad).post(auth.isLogout,userController.verifyUserLogin)
router.get('/logout',auth.isLogin,userController.userLogout)
router.get('/home',userController.loadHome)
router.get('/verify',auth.isLogout,userController.verifymail)
router.route('/otp-login').get(auth.isLogout,userController.otpload).post(auth.isLogout,userController.otpSending)
router.route('/otp-Verify').get(auth.isLogout,userController.otpVerifyload).post(auth.isLogout,userController.otpVerifiction)


router.get('/shop',userController.loadShop)
router.post('/filter',userController.filter)
router.get('/category-filter',userController.categoryFliter)
router.get('/product-detail',userController.loadProductInfo)
router.get('/profile',auth.isLogin, userController.loadprofile)
router.route('/edit-profile').get(auth.isLogin, userController.loadEditeProfile).post(auth.isLogin, userController.EditeProfile)
router.route('/cart').get(auth.isLogin,CartController.cartLoad).post( CartController.addToCart)
router.get('/cart/increment',auth.isLogin,CartController.increamentCart)
router.get('/cart/decrement',auth.isLogin,CartController.decreamentCart)
router.get('/cart/remove',auth.isLogin,CartController.removeCart)
router.get('/wishlist',auth.isLogin,CartController.WishlistLoad)
router.get('/wishlist/add',CartController.addToWishlist)
router.get('/wishlist/remove',auth.isLogin,CartController.removeWishlist)



router.get('/address',auth.isLogin,orderController.addressLoad)
router.route('/address-add').get(auth.isLogin,orderController.addAddressload).post(auth.isLogin,orderController.addAddress)
router.get('/address',auth.isLogin,orderController.addressLoad)
router.get('/address/remove',auth.isLogin,orderController.removeAddress)
router.route('/checkout').get(auth.isLogin,orderController.checkoutLoad).post(auth.isLogin,orderController.placeOrder)
router.get ('/razorpay',auth.isLogin,orderController.razorpay)
router.get('/checkout-success',auth.isLogin,orderController.checkoutSuccessload)
router.get('/myOrder',auth.isLogin,orderController.myOrderLoad)
router.get('/order-details',auth.isLogin,orderController.orderDetails)
router.get('/order-cancel',auth.isLogin,orderController.orderCanceled)
router.get('/order-return',auth.isLogin,orderController.orderReturn)
router.post('/coupon-apply',auth.isLogin,orderController.applyCoupon)


// router.get('*',(req,res) => res.render('404'));



module.exports = router ;
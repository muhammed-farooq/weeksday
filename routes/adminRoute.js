const express = require("express");
const router = express();

const session = require ('express-session');
const config = require ('../config/config');

router.use(session({secret:config.sessionSecret}));

router.set ('view engine','ejs');
router.set ('views','./views/admin');


const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination:(req,file,callback) => {
    
        callback(null,path.join(__dirname,'../public/product_img'));
    
    },
    filename: (req,file,callback) => {
    
        const name = Date.now()+'-'+file.originalname;
        callback(null,name);
    
    }
})

const upload = multer ({storage : storage});

const adminController = require ('../controllers/adminController');
const productController = require ('../controllers/productController');
const auth = require ('../middleware/adminAuth');
const orderController = require ('../controllers/orderController')


router.get('/',auth.isLogout,adminController.loadLogin);
router.get('/login',auth.isLogout,adminController.loadLogin);
router.post('/login',auth.isLogout,adminController.verifyAdminLogin);
router.get('/home',auth.isLogin,adminController.loadDashboard);
router.get('/home/userData',auth.isLogin,adminController.loadUserData);
router.get('/logout',auth.isLogin,adminController.logout);
router.get('/home/userData/block-unblock',auth.isLogin,adminController.blockUnblockUser)



router.get('/product',auth.isLogin,productController.produtsPageLoad);
router.route('/product/add-product').get(auth.isLogin,productController.addProductLoad).post(upload.array('images'),auth.isLogin,productController.addproduct);
router.route('/product/category').get(auth.isLogin,productController.addCategoryload).post(auth.isLogin,productController.addCategory)
router.get('/product/category/delete',auth.isLogin,productController.deleteCategory)
router.get('/product/list',auth.isLogin,productController.unListProduct)
router.get('/product/unlist',auth.isLogin,productController.ListProduct)
router.get('/product/image-remove',auth.isLogin,productController.produtsImgRemove)
router.route('/product/edit').get(auth.isLogin,productController.editProdctLoad).post(upload.array('images'),productController.editProduct)


router.route('/banner').get(auth.isLogin,adminController.bannerLoad).post(upload.array('images'),adminController.addBanner)
router.get('/banner/delete',auth.isLogin,adminController.bannerDelete)
router.get('/order-details',auth.isLogin,adminController.orderDetails);
router.get('/order/ship',auth.isLogin,orderController.orderShipped)
router.get('/order/delivery',auth.isLogin,orderController.orderDelivery)
router.route('/coupon').get(auth.isLogin,productController.couponLoad).post(auth.isLogin,productController.addCoupon)
router.get('/coupon/remove',auth.isLogin,productController.couponRemove)
router.get('/orders',auth.isLogin,adminController.loadOrderList)
router.route('/sales-report').get(auth.isLogin,adminController.salesReportLoad).post(auth.isLogin,adminController.salesReportFilter)


// .post(upload.array('images'),productController.editProduct)




module.exports = router ;
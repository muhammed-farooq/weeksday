const Admin = require ('../models/adminModel');
const User = require ('../models/userModel')
const Product = require ('../models/productModel')
const Category = require ('../models/categoryModel');
const Coupon = require('../models/couponModel');

let mes;
let message;
let msg;
//////////PRODUCT PAGE///////////

const produtsPageLoad = async (req,res) => {
    try {
        const product = await Product.find().populate('category')
        res.render ('product',{product,mes,message})
        message=null;
        mes=null;
    } catch (error) {
        console.log(error.message);
    }
}

//////////ADD PRODUCT PAGE///////////

const addProductLoad =async (req,res) => {
    try {
        const categorys = await Category.find()
        res.render ('add-product',{categorys})
    } catch (error) {
        console.log(error.message);
    }
}

//////////ADD PRODUCT///////////

const addproduct = async (req,res) => {
    try {
        const category = await Category.findOne({name:req.body.category});
        let images =[]
        for (let i = 0; i < 5; i++) {
            if(req.files.length == i ) break;
            images[i] = req.files[i].filename;           
        }
        const product = new Product({
            title:req.body.name,
            brand:req.body.brand,
            description:req.body.description,
            price:req.body.price,
            category:category._id,
            stocks:req.body.stock,
            size:req.body.size,
            color:req.body.color,
            images:images
        })

        const productData = await product.save()
        if (productData){
            res.redirect('/admin/product')
        }
        else {
            res.redirect('/admin/product/add-product')
        }
    } catch (error) {
        console.log(error.message);
    }
}


const unListProduct = async (req,res) => {
    try {
        const productId = req.query .id;
        const unlistproduct = await Product.updateOne({_id:productId},{$set:{listed:1}})
        if(unlistproduct){
            res.redirect('/admin/product')
        }else{
            mes = "can't Unlist product"
            res.redirect('/admin/product')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const ListProduct = async (req,res) => {
    try {
        const productId = req.query.id;
        const listproduct = await Product.updateOne({_id:productId},{$set:{listed:0}})
        if(listproduct){
            res.redirect('/admin/product')
        }else{
            mes = "can't Unlist product"
            res.redirect('/admin/product')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const produtsImgRemove = async(req,res) => {
    try {
        const file = req.query.file
        
        const productId = req.query.productId
            console.log(file,productId,'dfhhdgfh');
        await Product.updateOne({_id:productId},{ $pull:{images: file}})
            res.send({success:true,janu:'dddd'})
            
        } catch (error) {
            console.log(error.message);
        }
}


const editProdctLoad =async(req,res) => {
    try {
        const productId = req.query.id;
        const product = await Product.findById({_id:productId}).populate('category')
        const categorys = await Category.find()
        if (product) {
            res.render ('edit-product',{product,categorys,mes})
            mes = null
        } else {
            res.redirect('/admin/product/edit')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const editProduct = async (req,res) => {
            try {
                const productId = req.query.id;
                const {name,brand,description,category,price,stock,size,color} = req.body
                const categoryRef = await Category.findOne({name:category})
                const productImg = await Product.findOne({_id:productId})
                let images =[]
                if (req.files.length != 0) {
                    for (let i = 0; i < 5 - productImg.images.length; i++) {
                        if(req.files.length == i ) break;     
                        images[i] = req.files[i].filename;
                    }}
                    productImg.title = name;
                    productImg.brand = brand;
                    productImg.description = description;
                    productImg.category = categoryRef._id;
                    productImg.price = price;
                    productImg.stocks = stock;
                    productImg.size = size;
                    productImg.color = color;
                    productImg.images = productImg.images.concat(images);
                    const editProductData = await productImg.save()
                if (editProductData) {
                    message='Edited successfuly'
                    res.redirect('/admin/product')
                }else{
                mes = "did'nt add any image"
                res.redirect(`/admin/product/edit?id=${productId}`)
            }
        
        }catch (error) {
         console.log(error.message);       
        }
}

//////////ADD CATEGORY PAGE///////////

const addCategoryload = async (req,res) => {
    try {
        const category = await Category.find()
        res.render('category',{category,mes,message} )
        mes = null
        message = null
    } catch (error) {
        console.log(error.message);
    }
}

//////////ADD CATEGORY///////////

const addCategory =async (req,res) => {
    try {
        const category = req.body.category;
        const uppercaseCategory = category.toUpperCase();
        const recategory = await Category.findOne({name:uppercaseCategory})
        if (recategory){
            mes = 'this category already exsist'
            res.redirect('/admin/product/category')
        }else{
            const category = new  Category({
                name:req.body.category
            })
            const categorysaved =await category.save()
            if (categorysaved){
                message = 'saved succesfully'
                res.redirect('/admin/product/category')
            }
            else {
                mes = 'category couldnt saved'
                res.redirect('/admin/product/category')
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const 
deleteCategory = async (req,res) =>{
    try {
        const ID = req.query.id
        const product = await Product.find({category : new Object(ID)});
        if(product!=0){
            mes = " products exists in this category"
            res.redirect('/admin/product/category')
        }else{
            const categoryDelete = await Category.deleteOne({_id:ID});
            res.redirect('/admin/product/category')

        }

    } catch (error) {
        
    }
}

const couponLoad = async (req,res) =>{
    try {
        const date = new Date();
        const tomorrow = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        const dateOnly = tomorrow.toISOString().slice(0, 10);
        const coupons = await Coupon.find({})
        res.render('coupon',{coupons,date:dateOnly,mes,msg})
        mes = null ; 
        msg = null;
    } catch (error) {
        
    }
}

const addCoupon = async(req,res) => {
    try {
        const {title,couponCode,minPurchaseAmount,maxDiscountAmount,discount,expiryDate,quantity} = req.body
        console.log(title,couponCode,minPurchaseAmount,maxDiscountAmount,discount,expiryDate,quantity);
        if(title === '' || couponCode === '' || minPurchaseAmount === '' || maxDiscountAmount === '' || discount === '' || expiryDate === '' || quantity === ''){
            msg = 'fill out the form  !!'
            res.redirect('/admin/coupon')
        }else{

            const coupon = new Coupon({
                couponCode:couponCode,
                title : title,
                expiryDate : expiryDate,
                quantity : quantity,
                discount : discount,
                minPurchaseAmount:minPurchaseAmount,
                maxDiscountAmount : maxDiscountAmount
            })
    
            const save = coupon.save()
            if(save){
                mes = 'coupon added successfully'
                res.redirect('/admin/coupon')
            }else{
                msg = 'somthing wrong !!'
                res.redirect('/admin/coupon')
            }
        }

    } catch (error) {
        msg = 'somthing wrong !!'
        res.redirect('/admin/coupon')
    }
}


const couponRemove = async(req,res) => {
    try {
        const coupenId = req.query.coupenId
        const  coupon = await Coupon.deleteOne({_id:coupenId})
        if(coupon){
            res.send({success : true,message: "coupon removed"})
        }else{
            res.send({success : false,message: "somthing wrong try again!!"})

        }
    } catch (error) {

    }
}

const addCoupon1 = async(req,res)=>{

    try {

        const session = req.session.user_id
        const couponCode =  req.body.couponCode

        const coupon = await couponModel.findOne({couponCode : couponCode})
        const userCart = await cartModel.findOne({user : session})
        
        const couponDiscount = (coupon.discount / 100)

        if (coupon) {

            if (userCart.totalPrice >= coupon.minPurchaseAmount) {

                if (userCart.totalPrice * couponDiscount > coupon.maxDiscountAmount) {

                    const grand = coupon.maxDiscountAmount

                    await cartModel.updateOne({user:session},{$set:{couponDiscount:grand,couponID:coupon._id}})
                    
                    await couponModel.updateOne({couponCode :couponCode},{$push :{users :{user:session}}})
                    
                    res.redirect('/check-out')

                }else{

                     const grand = userCart.totalPrice * couponDiscount

                     await cartModel.updateOne({user:session},{$set:{couponDiscount:grand,couponID:coupon._id}})

                     await couponModel.updateOne({couponCode :couponCode},{$push :{users :{user:session}}})

                    res.redirect('/check-out')
               
                }
                
            }else{

                message = "minimum purchase not met"

                console.log(message);

            }
        }else {

            message = "coupon expired or not valid"

            console.log(message);
        }

        
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    produtsPageLoad,
    addProductLoad,
    addproduct,
    addCategoryload,
    addCategory,
    deleteCategory,
    unListProduct,
    ListProduct,
    produtsImgRemove,
    editProdctLoad,
    editProduct,
    couponLoad,
    addCoupon,
    couponRemove
 }
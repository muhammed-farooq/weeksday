const User = require ('../models/userModel')
const Product = require ('../models/productModel')
const Banner = require ('../models/bannerModel')
const Category = require('../models/categoryModel');

const bcrypt = require ('bcrypt');
const nodemailer = require ('nodemailer');

let mes;
let message;
const securPassword = async (password) =>{

    try {
      const passwordHash = await bcrypt.hash (password,10);
      return passwordHash
    }
    catch(error){
        console.log(error.message);
    }
}

const loadRegister = async (req,res) =>{
    try{
        res.render('registration',{message,mes}) 
        mes=null
        message=null
    }
    catch (err) {
        console.log(err.message);
    }
}

const sendVerifyMail = async (username, email, user_id) => {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user : 'cosfationhub@gmail.com',
            pass : 'pknvahayohjtivgt'
        },
      });
  
      const mailOption = {
        from: 'cosfationhub@gmail.com',
        to: email,
        subject: 'Email verification',
        html: `<p>Hii ${username}, please click <a href="http://127.0.0.1:3000/verify?id=${user_id}">here</a> to verify your email.</p>`,
      };
  
      transporter.sendMail(mailOption,(error, info) => {
        if (error) {
          console.log(error.message);
          console.log('Email could not be sent');
        } else {
          console.log('Email has been sent:',info.response);
        }
      });
    } catch (error) {
      console.log(error);
      console.log('Error occurred while sending email');
    }
  };

const isValidName = (name) => {
    // Check if the name contains only alphabets and spaces
    return /^[A-Za-z\s]+$/.test(name) && name.length >= 2 && name.length <= 50;
  }
const isValidPNumber = (num) => /^\d{10}$/.test(num);
const isValidEmail = (email) =>  {
    // Check if the email is in the correct format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    // Verify if the email domain exists and is valid (optional)
    // You can use a third-party service like dns.js to check the DNS records for the email domain
    // or use JavaScript's built-in DNS lookup API.
    // For example:
    // const domain = email.split('@')[1];
    // const dnsPromise = dns.resolveSoa(domain);
    // return dnsPromise.then(() => true).catch(() => false);
    return true;
  }
  
const validatePassword = (password) =>   {
    // Password must be at least 8 characters long
    if (password.length < 8) {
        mes="password dont have 8 characters"
      return mes;
    }
  
    // Password must contain at least one uppercase letter
    // if (!/[A-Z]/.test(password)) {
    //     mes="password dont have 8 characters"
    //   return false;
    // }
  
    // Password must contain at least one lowercase letter
    // if (!/[a-z]/.test(password)) {
    //   return false;
    // }
  
    // Password must contain at least one number
    if (!/\d/.test(password)) {
        mes ='Password must contain at least one number'
      return mes;
    }
  
    // Password is valid
    return mes = null;
  }
  
const insertUser = async (req,res) => {
        const repeatPNumber = await User.findOne({phoneNumber:req.body.phoneNumber});
        const repeatEmail = await User.findOne({email:req.body.email});
        const validName = isValidName(req.body.username);
        const validPNumber = isValidPNumber(req.body.phoneNumber);
        const validEmail = isValidEmail(req.body.email);
        const validPassword = validatePassword(req.body.password);
    try{
            if(req.body.username=='' && req.body.email=='' && req.body.phoneNumber=='' && req.body.password=='' && req.body.repassword==''){
                mes='Fill out the form'
                res.redirect('/register')       
            }
            else if(req.body.username==''){
                mes='enter you name'
                res.redirect('/register')
            }
            else if(req.body.email==''){
                mes = 'enter your email'
                res.redirect('/register')
            }
            else if(req.body.phoneNumber==''){
                mes='enter phone number'
                res.redirect('/register')
            }
            else if(req.body.password==''){
                mes = 'enter your password'
                res.redirect('/register')
            }else if(req.body.repassword==''){
                mes = 'repteat your password'
                res.redirect('/register')
            }
            else if(!validName){
                mes = 'name not correct'
                res.redirect('/register')
            }
            else if(repeatPNumber){
                mes='phone number already exist'
                res.redirect('/register')
            }
            else if(!validPNumber){
                mes = 'phone number not correct'
                res.redirect('/register')
            }
            else if(repeatEmail){
                mes='Email already exist'
                res.redirect('/register')
            }
            else if(!validEmail){
                mes = 'email not in popper way'
                res.redirect('/register')
            }
            else if(validPassword != null){
                mes = validPassword
                res.redirect('/register')
            }else if(req.body.password != req.body.repassword){
                mes = 'repteat  password not correct'
                res.redirect('/register')
            }
        else{
            const spassword = await securPassword(req.body.password)
            const  user = new User({
                Username : req.body.username,
                email : req.body.email,
                phoneNumber : req.body.phoneNumber,
                password: spassword 
            })
            const userData = await user.save();
            if(userData) {
                sendVerifyMail(req.body.username,req.body.email,userData._id)
                message = "your registration has been succesfully please verify your mail"
                res.redirect('/login')
            }else{
            mes = "your registration has been failed please try again"
            res.redirect('/register')
            }
        }
    }

    catch (error){
        console.log(error.message);
    }

}
const verifymail =async (req,res) => {
    try {
        const id = req.query.id
        const updateinfo =await  User.updateOne({_id:id},{$set:{is_verified:1} });
        res.render('email-verify');
    } catch (error) {
        console.log(error.messege);
    }
}


// LOGIN  USER METHODE STARTEFD

const loginLoad = async (req,res) =>{

    try {
        res.render('login',{mes,message});
        mes = null;
        message = null;
    } catch (error) {    
        console.log(error.message)
    }
} 

const verifyUserLogin = async (req,res) =>{
    try{
        const emailId = req.body.email
        const passwordId = req.body.password
        if(req.body.email==''&& req.body.password==''){
            mes = 'Enter email and password'
            res.redirect('/login')     
        }else if(req.body.email==''){
            mes = 'Enter your email'
            res.redirect('/login')
        }else if(req.body.password==''){
            mes = 'enter your password'
            res.redirect('/login')
        }else{
            const userData = await User.findOne({email:emailId});   
            if (userData) {
                // if (userData.is_verified == 1) {
                    if (userData.is_blocked == 0){
                        const passwordMatch = await bcrypt.compare(passwordId,userData.password);

                        if(passwordMatch){

                            req.session.user_Id = userData._id;  

                            res.redirect('/home')
            
                        }else{
                            mes = "password is incorrect"
                            res.redirect('/login')
                        }  
                    }else{
                        mes = "you are blocked"
                        res.redirect('/login')
                    }
                   
                // }else{
                // mes = "you dont verify mail"
                // res.redirect('/login')
                    
                // }
            }else {
                mes = "email incorrect"
                res.redirect('/login')
            }
        }
    }
       
    catch (err) {
        console.log(err.message);
    }
}

//// otp login page
const otpload = (req,res) =>{
    try {
        res.render('otpLogin',{mes})
        mes = null;
    } catch (error) {
        console.log(error.message);
    }
}


////otp verification page
const otpVerifyload = (req,res) =>{
    try {
        res.render('otp-verify',{mes})
        mes = null
    } catch (error) {
        console.log(error.message);
    }
}



function otpgen(){
    OTP=Math.random()*1000000
    OTP=Math.floor(OTP)
    return OTP
}
let otp

//////////OTP GENERATION///////////
let otpCheckMail

const otpSending = async(req,res)=>{
    try {
        if(req.body.email.trim().length==0){
            res.redirect('/otp-login')
            mes='Please enter email !!!'
        }else{
            otpCheckMail = req.body.email
            const userData = await User.findOne({email:otpCheckMail})
            if(userData){
                if(userData.is_verified==1){
                    if(userData.is_blocked==0){
                        mes = 'check your mail OTP mailed'
                        res.redirect('/otp-Verify')
                        const mailtransport = nodemailer.createTransport({
                            host: 'smtp.gmail.com',
                            port: 465,
                            secure: true,
                            auth: {
                                user : 'cosfationhub@gmail.com',
                                pass : 'pknvahayohjtivgt'
                            },
                            });

                        otp=otpgen()
                        let details={
                            from:"cosfationhub@gmail.com",
                            to:otpCheckMail,
                            subject:"COS Email Verification",
                            text: otp+" is your COS verification code. Do not share OTP with anyone "
                        }
                        mailtransport.sendMail(details,(err)=>{
                            if(err){
                                console.log(err);
                            }else{
                                console.log("success");
                            }
                        })
                    }else{
                        res.redirect('/otp-login')
                        mes='Your account has been blocked !!!'
                    }
                }else{
                    res.redirect('/otp-login')
                    mes='Email not verified !!!'
                }
            }else{
                res.redirect('/otp-login')
                mes='User not found !!!'
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

const otpVerifiction = async(req,res)=>{
    try {        
        if(req.body.otp.trim().length==0){
            res.redirect('/otp-Verify')
            mes='Please Enter OTP'
        }else{
            const OTP = req.body.otp
            if(otp==OTP){
                const userData = await User.findOne({email:otpCheckMail})  
                req.session.user_Id = userData._id;
                res.redirect('/')
            }else{
                res.redirect('/otp-Verify')
                mes='OTP is Incorrect'
                }
    } 
    }catch (error) {
        console.log(error.message);   
    }
}

//    home

const loadHome = async (req,res) => {
    try {
        const userData = await User.findOne({_id:req.session.user_Id});
        const products = await Product.find({listed:0}).limit(6)
        const banner = await Banner.find().sort({no:1})
        console.log(userData);
        res.render('home',{user:userData,products,banner})
    } catch (error) {
        console.log(error.message);
    }
}

//    Shop

const loadShop = async (req,res) => {
    try {
        const userData = await User.findOne({_id:req.session.user_Id});
        const products = await Product.find({listed:0}).limit(12)
        const category = await Category.find({})
        res.render('shop',{user:userData,products,category})
    } catch (error) {
        console.log(error.message);
    }
}

const filter = async (req,res) => {
    try {
        console.log(req.body)
        const category = req.body.category
        const sort = req.body.sort
        const search = req.body.search
        let products;
        if(!category && !sort && !search){
            products = await Product.find({listed: 0 }).limit(12).populate('category');
            console.log('vvkmv');
        }
        else if(category && sort && search){
            if(category === 'all'){
                console.log(category,'dfdhfv');
                if(sort === 'highestPrice'){
                    products = await Product.find(
                        {title: { $regex: '.*' + search + '.*', $options: 'i' } , listed: 0 }).limit(12).sort({price:-1}).populate('category'); 
                }else if(sort === 'lowestPrice'){
                    products = await Product.find(
                        {title: { $regex: '.*' + search + '.*', $options: 'i' } , listed: 0 }).limit(12).sort({price:1}).populate('category'); 
                }else if(sort === 'all'){
                    products = await Product.find(
                        {title: { $regex: '.*' + search + '.*', $options: 'i' } , listed: 0 }).limit(12).populate('category'); 
                }else {
                    products = await Product.find(
                        {title: { $regex: '.*' + search + '.*', $options: 'i' } , listed: 0 }).limit(12).populate('category'); 
                }
            }else{
                if(sort === 'highestPrice'){
                    products = await Product.find(
                        {title: { $regex: '.*' + search + '.*', $options: 'i' } ,category: category, listed: 0 }).limit(12).sort({price:-1}).populate('category'); 

                }else if(sort === 'lowestPrice'){
                    products = await Product.find(
                        {title: { $regex: '.*' + search + '.*', $options: 'i' } ,category: category, listed: 0 }).limit(12).sort({price:1}).populate('category'); 
                }else if(sort === 'all'){
                    products = await Product.find(
                        {title: { $regex: '.*' + search + '.*', $options: 'i' } ,category: category, listed: 0 }).limit(12).populate('category'); 
                }else {
                    products = await Product.find(
                        {title: { $regex: '.*' + search + '.*', $options: 'i' } ,category: category, listed: 0 }).limit(12).populate('category'); 
                }
            }

                  
                
                

        }
        else if(!category && !sort && search){

            products = await Product.find(
                {title: { $regex: '.*' + search + '.*', $options: 'i' } }).limit(12).populate('category');

        }
        else if (!category && sort && !search){

            if(sort === 'highestPrice'){
                products = await Product.find(
                    {listed: 0 }).limit(12).sort({price:-1}).populate('category');

            }else if(sort === 'lowestPrice'){
                products = await Product.find(
                    { listed: 0 }).limit(12).sort({price:1}).populate('category');

            }else if(sort === 'all'){
                products = await Product.find(
                    { listed: 0 }).limit(12).populate('category');
            }else {
                products = await Product.find(
                    {listed: 0  }).limit(12).populate('category');
            } 
        }
        else if(category && !sort && !search){
            if(category === 'all'){
                products = await Product.find(
                    { listed: 0 }).limit(12).populate('category'); 
            }else{
                products = await Product.find(
                    {category: category, listed: 0 }).limit(12).populate('category'); 
            }


        }
        else if(category && sort && !search){
            if(category != 'all'){
                if(sort === 'highestPrice'){
                    products = await Product.find(
                        {category: category, listed: 0 }).limit(12).sort({price:-1}).populate('category');
    
                }else if(sort === 'lowestPrice'){
                    products = await Product.find(
                        {category: category, listed: 0 }).limit(12).sort({price:1}).populate('category');
    
                }else if(sort === 'all'){
                    products = await Product.find(
                        {category: category, listed: 0 }).limit(12).populate('category');
                }else {
                    products = await Product.find(
                        {category: category , listed: 0  }).limit(12).populate('category');
                }
            }else{
                if(sort === 'highestPrice'){
                    products = await Product.find(
                        { listed: 0 }).limit(12).sort({price:-1}).populate('category');
    
                }else if(sort === 'lowestPrice'){
                    products = await Product.find(
                        { listed: 0 }).limit(12).sort({price:1}).populate('category');
    
                }else if(sort === 'all'){
                    products = await Product.find(
                        { listed: 0 }).limit(12).populate('category');
                }else {
                    products = await Product.find(
                        { listed: 0  }).limit(12).populate('category');
                }
            }
        }
        else if(!category && sort && search){

            if(sort === 'highestPrice'){
                products = await Product.find(
                    {title: { $regex: '.*' + search + '.*', $options: 'i' } , listed: 0 }).limit(12).sort({price:-1}).populate('category');

            }else if(sort === 'lowestPrice'){
                products = await Product.find(
                    {title: { $regex: '.*' + search + '.*', $options: 'i' } , listed: 0 }).limit(12).sort({price:1}).populate('category');

            }else if(sort === 'all'){
                products = await Product.find(
                    {title: { $regex: '.*' + search + '.*', $options: 'i' } , listed: 0 }).limit(12).populate('category');
            }else {
                products = await Product.find(
                    {title: { $regex: '.*' + search + '.*', $options: 'i' } , listed: 0  }).limit(12).populate('category');
            }

        }else if(category && !sort && search){
            if(category === 'all'){
                products = await Product.find(
                    {title: { $regex: '.*' + search + '.*', $options: 'i' } , listed: 0  }).limit(12).populate('category');
            }else{
                products = await Product.find(
                    {title: { $regex: '.*' + search + '.*', $options: 'i' } ,category:category, listed: 0  }).limit(12).populate('category');
            }
        }


        res.send({success:true,products})
    } catch (error) {
        console.log(error.message);
    }
}



const categoryFliter = async (req,res) => {
    try {
        const categoryId = req.query.categoryId
        const products = await Product.find({ category: categoryId, listed: 0 }).limit(12).populate('category');
        res.send({success:true,products:products})
    } catch (error) {
        console.log(error.message);
    }
}


// product detials

const loadProductInfo = async (req,res) => {
    try {
        const userData = await User.findOne({_id:req.session.user_Id});
        const product = await Product.findOne({_id:req.query.id})
        res.render('product-detail',{user:userData,product})
    } catch (error) {
        console.log(error.message);
    }
}


const loadprofile = async (req,res) => {
    try {
        const userData = await User.findOne({_id:req.session.user_Id});
        res.render('profile',{user:userData})
    } catch (error) {
        console.log(error.message);
    }
}


const userLogout = async (req,res) => {

    try {
        req.session.user_Id=null
        res.redirect('/')

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifymail,
    loginLoad,
    verifyUserLogin,
    otpload,
    otpVerifyload,
    otpSending,
    otpVerifiction,
    loadHome,
    loadShop,
    filter,
    categoryFliter,
    loadProductInfo,
    loadprofile,
    userLogout
}

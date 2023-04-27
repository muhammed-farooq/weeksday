 const Admin = require ('../models/adminModel');
 const User = require ('../models/userModel');
 const Banner = require ('../models/bannerModel')
const Order = require("../models/orderModel");

const bcrypt = require ('bcrypt');

let mes;
let message;
let msg;
//////////ADMIN LOGIN ///////////

 const loadLogin = async (req,res) => {
    try {
        console.log(req.session);
        res.render('aLogin',{mes})
        mes = null
    } catch (error) {
        console.log(error.messege);
    }
 }

//////////VERIFICATIOIN OF ADMIN///////////

 const verifyAdminLogin = async (req,res) => {

    try{
        const Aemail = req.body.email
        const Apassword = req.body.password
        if(req.body.email==''&& req.body.password==''){
            mes = 'Enter email and password'
            res.redirect('/admin')
  
        }else if(req.body.email==''){
            mes = 'Enter  email'
            res.redirect('/admin')

        }else if(req.body.password==''){
            mes = 'enter  password'
            res.redirect('/admin')

        }else{
            const adminData = await Admin.findOne({email:Aemail});

            if (adminData) {
                const passwordMatch = await bcrypt.compare(Apassword,adminData.password);
                if(passwordMatch){
                    req.session.admin_Id = adminData._id;
                    res.redirect('/admin/home')
                } else{
                     mes = "password is incorrect"
                     res.redirect('/admin')
                 } 
            }else {
                 mes = "email incorrect"
                 res.redirect('/admin')
            }
        }
    }
    catch (err) {  
        console.log(err.message);
    }
}

//////////ADMIN HOME PAGE///////////

const loadDashbord3 = async (req,res) => {
    try {
        const date = new Date()
        const dateOnly =new Date(date).toLocaleDateString()
        console.log(dateOnly);
        const orders = await Order
        .find({})
        .sort({ _id: -1 });  
        res.render('aHome',{orders})
    } catch (err) {
        console.log(err.message);
    }
}
const loadDashboard = async (req, res) => {
    try {
      const userData = await User.find();
      const usersLength = userData.length;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
  
      const yearAgo = new Date(today);
      yearAgo.setFullYear(today.getFullYear() - 1);
  
      const dailySalesReport = await Order.aggregate([
        { $unwind: "$products" },
        {
          $match: {
            status: "Delivered",
            deliveredDate: {
              $gte: today,
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$deliveredDate" } },
            totalSales: { $sum: { $subtract: ["$products.price", "$discount"] } },
            totalItemsSold: { $sum: "$products.quantity" },
          },
        },
        { $sort: { _id: 1 } },
      ]);
  
      const weeklySalesReport = await Order.aggregate([
        { $unwind: "$products" },
        {
          $match: {
            status: "Delivered",
            deliveredDate: {
              $gte: weekAgo,
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$deliveredDate" } },
                totalSales: { $sum: { $subtract: ["$products.price", "$discount"] } },
                totalItemsSold: { $sum: "$products.quantity" },
              },
        },
        { $sort: { _id: 1 } },
      ]);
  console.log(weeklySalesReport,'this is it',dailySalesReport);
      const yearlySalesReport = await Order.aggregate([
        { $unwind: "$products" },
        {
          $match: {
            status: "Delivered",
            deliveredDate: {
              $gte: yearAgo,
              $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$deliveredDate" } },
            totalSales: { $sum: { $subtract: ["$products.price", "$discount"] } },
            totalItemsSold: { $sum: "$products.quantity" },
          },
        },
        { $sort: { _id: 1 } },
      ]);
  
      ////////////////////////////////// linechart//////////////////////////////////////////////////////
  
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
      const monthlyStart = new Date(currentYear, currentMonth, 1).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const monthlyEnd = new Date(currentYear, currentMonth, daysInMonth);
      console.log("sxkhjdfgdjhasgdhjsfgdghjfg");
  
      const monthlySalesData = await Order.find({
        deliveredDate: {
          $gte: monthlyStart,
          $lte: monthlyEnd,
        },
      }).populate("products.productId");


      const dailySalesDetails = [];

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const salesOfDay = monthlySalesData.filter((order) => {
          return new Date(order.deliveredDate).toDateString() === date.toDateString();
        });
        const totalSalesOfDay = salesOfDay.reduce((total, order) => {
            return total + order.GrandTotal;
        }, 0) 

        const discount = salesOfDay.reduce((totalDiscount, order) => {
            return totalDiscount + order.discount;
        }, 0);
        console.log(discount);
        let productCountOfDay = 0;
        salesOfDay.forEach((order) => {
          productCountOfDay += order.products.quantity;
        });
      
        dailySalesDetails.push({
          date: date,
          totalSales: totalSalesOfDay-discount,
          totalItemsSold: productCountOfDay,
        });
      }
      
      console.log('sxkhjdfgdjhasgdhjsfgdghjfg');
      
        const order = await Order.aggregate([
          {
            $group: {
              _id: "$paymentType",
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              codCount: {
                $sum: {
                  $cond: { if: { $eq: ["$_id", "cod"] }, then: "$count", else: 0 },
                },
              },
              razorpayCount: {
                $sum: {
                  $cond: { if: { $eq: ["$_id", "Razorpay"] }, then: "$count", else: 0 },
                },
              },
              walletCount: {
                $sum: {
                  $cond: { if: { $eq: ["$_id", "wallet"] }, then: "$count", else: 0 },
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              codCount: 1,
              razorpayCount: 1,
              walletCount: 1,
            },
          },
        ]);
      
        res.render("aHome", {
          dailySalesReport,
          weeklySalesReport,
          yearlySalesReport,
          message,
          usersLength,
          dailySalesDetails,
          order,
        });
        message = null;
      } catch (error) {
        res.status(500).send("Server Error");
      }
    }

const loadDashbord1 = async (req, res) => {
    try {
        const orderdetails = await Order.find({})
        const totalOrders = orderdetails.length
        const totalPage = Math.ceil(totalOrders / limit)
        const userData = await User.find()
        const usersLength = userData.length
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);

        const dailySalesReport = await Order.aggregate([
            {
                $match: {
                    "order.status": "OrderDelivered",
                    "order.deliveredDate": { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            { $unwind: "$order" },
            {
                $match: {
                    "order.status": "OrderDelivered",
                    "order.deliveredDate": { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$order.deliveredDate" } },
                    totalSales: { $sum: "$grandtotal" },
                    totalItemsSold: { $sum: "$order.quantity" },
                },
            },
            { $sort: { _id: 1 } },
        ]);



        const weeklySalesReport = await orderschema.aggregate([
            {
                $match: {
                    "order.status": "OrderDelivered",
                    "order.deliveredDate": { $gte: weekAgo, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            { $unwind: "$order" },
            {
                $match: {
                    "order.status": "OrderDelivered",
                    "order.deliveredDate": { $gte: weekAgo, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$order.deliveredDate" } },
                    totalSales: { $sum: "$grandtotal" },
                    totalItemsSold: { $sum: "$order.quantity" },
                },
            },
            { $sort: { _id: 1 } },
        ]);


        const yearlySalesReport = await orderschema.aggregate([
            {
                $match: {
                    "order.status": "OrderDelivered",
                    "order.deliveredDate": { $gte: yearAgo, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            { $unwind: "$order" },
            {
                $match: {
                    "order.status": "OrderDelivered",
                    "order.deliveredDate": { $gte: yearAgo, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$order.deliveredDate" } },
                    totalSales: { $sum: "$grandtotal" },
                    totalItemsSold: { $sum: "$order.quantity" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        ////////////////////////////////// linechart//////////////////////////////////////////////////////

        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

        const monthlyStart = new Date(currentYear, currentMonth, 1).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const monthlyEnd = new Date(currentYear, currentMonth, daysInMonth);

        const monthlySalesData = await orderschema.find({
            'order.deliveredDate': {
                $gte: monthlyStart,
                $lte: monthlyEnd,
            },
        });

        const dailySalesDetails = []
        for (let i = 2; i <= daysInMonth + 1; i++) {
            const date = new Date(currentYear, currentMonth, i)
            const salesOfDay = monthlySalesData.filter((order) => {
                return new Date(order.order[0].deliveredDate).toDateString() === date.toDateString()
            })
            const totalSalesOfDay = salesOfDay.reduce((total, order) => {
                return total + order.grandtotal;
            }, 0);
            let productCountOfDay = 0;
            salesOfDay.forEach((order) => {
                productCountOfDay += order.order[0].quantity;
            });

            dailySalesDetails.push({ date: date, totalSales: totalSalesOfDay, totalItemsSold: productCountOfDay });
        }

        const order = await orderschema.aggregate([
            { $unwind: "$order" },  // deconstruct the "order" array
            {
                $group: {
                    _id: "$order.paymentmethod",
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    codCount: {
                        $sum: {
                            $cond: { if: { $eq: ["$_id", "cod"] }, then: "$count", else: 0 }
                        }
                    },
                    razorpayCount: {
                        $sum: {
                            $cond: { if: { $eq: ["$_id", "razorpay"] }, then: "$count", else: 0 }
                        }
                    },
                    walletCount: {
                        $sum: {
                            $cond: { if: { $eq: ["$_id", "wallet"] }, then: "$count", else: 0 }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    codCount: 1,
                    razorpayCount: 1,
                    walletCount: 1
                }
            }
        ]);


        res.render("adminhome", {
            dailySalesReport,
            weeklySalesReport,
            yearlySalesReport,
            message,
            usersLength,
            dailySalesDetails,
            order,
            admin: userdetails,
            orderData,
            currentPage,
            totalPage
        }),
            (message = null);






    } catch (error) {
        console.log(error.message);
    }
}


const loadOrderList =  async (req,res) => {
    try {
        const date = new Date()
        const dateOnly =new Date(date).toLocaleDateString()
        console.log(dateOnly);
        const orders = await Order
        .find({})
        .sort({ _id: -1 });  
        res.render('orders',{orders})
    } catch (err) {
        console.log(err.message);
    }
}


const orderDetails = async (req,res) => {
    try {
        const orderId = req.query.id
        const order = await Order
        .findOne({_id:orderId})
        .populate('products.productId')
        .sort({ _id: -1 });  
        console.log(order.products[0].productId.price);
        res.render('order-details',{order})
    } catch (error) {
     console.log(error.message);
    }
}





//////////USER PAGE///////////

const loadUserData =async (req,res) => {
    try {
        const userData = await User.find({})
        res.render('userData',{users:userData})
    } catch (error) {
        console.log(error.message);
    }
}

//////////BLOCKING,UNBLOCKING USER///////////

const blockUnblockUser = async (req,res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({_id:id});
        if (userData.is_blocked == 0) {
            const userblockedData = await User.updateOne({_id:id},{$set:{is_blocked:1}});
            req.session.user_Id =null
            res.redirect('/admin/home/userData')
        } else {
            const userunblockedData = await User.updateOne({_id:id},{$set:{is_blocked:0}});
            res.redirect('/admin/home/userData')
        }
    } catch (error) {
        console.log(error.messege); 
    }
}

//////////BANNER MANAGMENT////////

const bannerLoad =async (req,res) => {
    try {
        const banners = await Banner.find() 
        console.log(msg);
        res.render('banner',{banners,mes,message,msg})
        mes = null; 
        message = null;
        msg=null;
    } catch (error) {
        console.log(error);
    }
}


const addBanner =async (req,res) => {
    try {
        if(req.body.title == '' &&req.body.description == '' &&req.files == ''){
            msg = 'fill out the fome'
            res.redirect('/admin/banner')
        }else if(req.body.title == ''){
            msg = 'enter title'
            res.redirect('/admin/banner')
        }else if(req.body.description == ''){
            msg = 'enter description'
            res.redirect('/admin/banner')
        }else if(req.files == ''){
            msg = 'add image'
            res.redirect('/admin/banner')
        }
        else{
            let images =[];
            for (let i = 0; i < req.files.length; i++) {
                images[i] = req.files[i].filename;           
            }
            // for (let i = 0; i < images.length; i++) {
            //     console.log(images[i]);
                
            // }
            const addBanner = new Banner({
                title:req.body.title,
                description:req.body.description,
                images:images
            })  
            const bannerData = await addBanner.save()
            if (bannerData) {
                message = 'Banner added'
                res.redirect('/admin/banner')        
            } else {
                mes = "Could'nt add banner"
                res.redirect('/admin/banner')                
            }
        }

    } catch (error) {
        
    }
}


const bannerDelete = async (req,res) => {
    try {
        const banner = await Banner.findByIdAndDelete({_id:req.query.id});
        if(banner){
            message = 'Banner deleted'
            res.redirect('/admin/banner')                
        }
    } catch (error) {
        console.log(error.message);
    }
}


const salesReportLoad = async (req,res) => {
    try {

        const sales = await Order.find({ status: "Delivered" }).sort({ _id: -1 });
        const data = []; // Initialize data as an empty array
        // sales.forEach(function(element,i) {
        //   data[i] = element.products.filter(function(product) {
        //     return product.status === 'Delivered'
        //   })
        // });
      
        // console.log(sales,'ifiudghfjkgdfhj','fgjghdkjfhkjdhfkjh',data);
        res.render("sales-report", { sales })
    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}


const salesReportFilter = async (req,res) => {
    try {
        let { startingDate, endingDate } = req.body;
        startingDate = new Date(startingDate)
        endingDate = new Date(endingDate)
        if(startingDate === '' && endingDate === ''){
            res.send({success:false,message:"plese select the date"})
        }else if(startingDate === ''){
            res.send({success:false,message:"plese select the starting date"})
        }else if (endingDate === ''){
            res.send({success:false,message:"plese select the ending date"})
        }else{
          const sales = await Order.find({ 
                status: "Delivered",
                deliveredDate: {
                  $gte: startingDate,
                  $lte: endingDate
                }
              }).sort({ _id: -1 });
                res.send({success:true,sales:sales})
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Server Error");
    }
}


//////////ADMIN LOGOUT///////////

const logout = async (req,res) => {
    try {
        req.session.admin_Id=null
        res.redirect('/admin')  
    } catch (error) {
        console.log(error.message);
    }
}


 module.exports = {
    loadLogin,
    verifyAdminLogin,
    loadDashboard,
    loadOrderList,
    orderDetails,
    loadUserData,
    blockUnblockUser,
    bannerLoad,
    addBanner,
    bannerDelete,
    salesReportLoad,
    salesReportFilter,
    logout
 }
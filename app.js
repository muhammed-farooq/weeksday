const express = require ('express')
const app = express()
const logger = require('morgan')
const dotenv = require ('dotenv').config({path:".env"})
const connectDatabase = require ('./config/databace')
const nocache = require ('nocache')
const path = require ('path')
const errorHandler = require ("./middleware/error")

app.use(nocache());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'))
// app.use(errorHandler)
// parse application/json
app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const adminRoute = require ('./routes/adminRoute');
const userRoute = require ('./routes/userRoute');
const errorRoute = require ('./routes/404Route')

app.use ('/', userRoute);
app.use ('/admin', adminRoute);
app.use ('/', errorRoute)

// CONECTING TO DATABACE

connectDatabase( ); 
// SARVER

app.listen(process.env.PORT,()=> console.log(`SARVER IS WORKING ON http://localhost:${process.env.PORT}`));
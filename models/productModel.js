const mongoose= require ('mongoose')


const  productSchema = new mongoose.Schema({

    title : {
        type : String,
        required :[true,"Please enter the name"],
        minLength : [3,"Please enter minimum 3 charecter"]
    },
    description : {
        type : String ,
        require : true
    },
    images :
    {
        type : Array,
        require :true
    },
    price : {
        type : Number ,
        required : true,
    },
    brand : {
        type : String ,
        required : true,
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category',
        required : true,
    },
    stocks : {
        type : Number ,
        required : true,
    },size : [{
        type :String,
        required :true
    }],
    color : [{
        type :String,
        required :true
    }],
    reviews : [
        {
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    listed:{
        type:Number,
        required:true,
        default:0
    }
})


const productModel = mongoose . model ('Products' , productSchema )

module.exports = productModel 
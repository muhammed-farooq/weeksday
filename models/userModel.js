const mongoose= require ('mongoose')

// ---------- schema creation
const Schema = mongoose.Schema;

const addressScema = new Schema({
 
    name: {
        type: String,
        required: true
    },
    houseName: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    mobilNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        require: true
    }

})

// const productsSchema = new Schema({
//     productId: {
//         type: String,
//         required: true
//     },
//     quantity: {
//         type: String,
//         required: true
//     },
//     price: {
//         type: String,
//         required: true
//     },
//     status: {
//         type: String,
//         required: false,
//         default: "placed"
//     }
// })
const userSchema = new Schema({
    Username : {
        type : String ,
        required : true,
    },
    email : {
        type : String,
        required : true
    },
    phoneNumber:{
        type : String,
        require : true,
        unique:true
    },
    password : {
        type : String ,
        require : true
    },
    addresses:[addressScema],
    is_admin : {
        type : Number ,
        require : true,
        default : 0
    },
    wallet :{
        type :Number,
        default : 0
    },
    is_verified : {
        type :Number,
        default : 0
    },
    is_blocked:{
        type:Number,
        default:0
    }
})




const userModel = mongoose . model ('User' , userSchema )

module.exports = userModel 
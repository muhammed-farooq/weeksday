const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bannerSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images : {
        type: Array, 
        require: true
    },
    active:{
        type: String,
        default:''
    }
})

const bannerModel  = mongoose.model("Banner", bannerSchema);
module.exports = bannerModel 
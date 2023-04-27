const mongoose= require ('mongoose')

// ---------- schema creation


const catogorySchema = new mongoose.Schema({
    
    name : {
        type : String,
        uppercase:true,
        required : true,
    }
})




const categoryModel = mongoose . model ('Category' , catogorySchema )

module.exports = categoryModel 
import mongoose from "mongoose";

const friendrequestSchema =  new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    status:{
        type:String,
        enum:['pending', 'accepted'],
        default:'pending',
    },
},{
    timestamps:true,
}
);

const friendrequest = mongoose.model('friendrequest', friendrequestSchema);

export default friendrequest;
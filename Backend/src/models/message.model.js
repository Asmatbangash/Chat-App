import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    recievedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    text: {
        type: String,
    },
    seen: {
        type: Boolean,
    },
    

})

export const Message = mongoose.model("Message", messageSchema)
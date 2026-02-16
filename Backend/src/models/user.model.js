import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    profilePic:{
        type: String
    },
    FullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
    },

})

export const User = mongoose.model("User", userSchema)
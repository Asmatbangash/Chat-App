import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import dotenv from 'dotenv'

dotenv.config()

const protectRoute = async(req,res,next) =>{
    try {
        const token = req.headers.token
        const decoded = jwt.verify(token, process.env.JWT_SECRETE_KEY)
        console.log("decoded",decoded)
        const user = await User.findById(decoded.userId).select("-password")
        if(!user){
            res.json({success: false, message:"user not found!"})
        }
        req.user= user
        next()
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message })
    }
}

export default protectRoute;
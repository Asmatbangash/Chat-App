import jwt from "jsonwebtoken";
import { jwtSecret } from "../lib/utills.lib.js";
import { User } from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }
        // Use shared secret source used by token generator/socket auth.
        const decoded = jwt.verify(
            token,
            jwtSecret
        );
        const user = await User.findById(decoded.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("VERIFY ERROR:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }

};

export default protectRoute;

import {v2 as cloudinary} from 'cloudinary'
import dotenv from "dotenv";

dotenv.config();

// Prefer corrected env key, fallback keeps old setups working.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRETE
})

export default cloudinary;

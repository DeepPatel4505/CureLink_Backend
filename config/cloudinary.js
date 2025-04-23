// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import "./config.js"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});
console.log("Cloud connected");

const uploadImg = async(image)=>{
    const res  = await cloudinary.uploader.upload(image);
    return res.secure_url;
}

export default uploadImg;

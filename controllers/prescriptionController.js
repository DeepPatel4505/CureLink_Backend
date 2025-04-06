import respond from "../utils/jsonresponse.js"
import getDataUri from "../utils/dataUri.js"
import cloudinary from "cloudinary";


export const addPrescription = async(req,res)=>{
    const file = req.file;
    const fileUrl = getDataUri(file);
    // console.log(fileUrl);
    const myCloud = await cloudinary.v2.uploader.upload(fileUrl.content)
    
    const imageUrl = myCloud.secure_url;

    respond(res,200,"Prescription Uploaded",imageUrl)
    
}
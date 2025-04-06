import app from "./app.js";
import connectDB from "./config/db.js";
import cloudinary from "cloudinary";

connectDB()
    .then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .then(() =>{
        cloudinary.v2.config({
            cloud_name : process.env.CLOUD_NAME,
            api_key : process.env.CLOUD_API_KEY,
            api_secret : process.env.CLOUD_API_SECRET,
        })
    })
    .catch((err) => {
        console.error(err);
    });

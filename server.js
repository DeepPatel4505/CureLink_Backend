import app from "./app.js";
import connectDB from "./config/db.js";
import cloudinary from "cloudinary";
import "./config/config.js"

connectDB()
    .then(() => {
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error(err);
    });

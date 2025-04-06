import multer from "multer";
import fs from "fs";
import path from "path";

// Define the absolute path for the upload directory
const uploadDir = path.join(process.cwd(), "temp");

// Ensure the temp directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage({
    destination: (req, file, cb) => {
        console.log("Uploading to:", uploadDir);  // Debugging line
        cb(null, uploadDir); // Ensure the correct path is passed
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const singleUpload = multer({ storage }).single("file");

export default singleUpload;

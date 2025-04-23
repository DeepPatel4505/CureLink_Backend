import multer from "multer";

// Use simple memory storage without the destination function
const storage = multer.memoryStorage();

// Add some logging to check what's happening
const singleUpload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        console.log("Multer processing file:", file.originalname);
        cb(null, true);
    },
}).single("file");

// Wrap the multer middleware to catch errors
export default function (req, res, next) {
    singleUpload(req, res, function (err) {
        if (err) {
            console.error("Multer error:", err);
            return res.status(400).json({
                success: false,
                message: `File upload error: ${err.message}`,
            });
        }
        console.log("File uploaded to memory successfully");
        next();
    });
}

import express from "express";
import singleUpload from "../middleware/mullter.js";
import { addPrescription } from "../controllers/prescriptionController.js";


const router = express.Router();

// Routes

//user
// router.get("/user/:id",userPrescription);


//receptionist
router.post("/add",singleUpload,addPrescription)



export default router;

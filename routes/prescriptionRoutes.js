import express from "express";
import singleUpload from "../middleware/mullter.js";
import { addPrescription,getPrescription } from "../controllers/prescriptionController.js";


const router = express.Router();

// Routes

//user
// router.get("/user/:id",userPrescription);


//receptionist
router.post("/add",singleUpload,addPrescription)

router.get("/get/:id",getPrescription)



export default router;

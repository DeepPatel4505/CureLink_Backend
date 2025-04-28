import respond from "../utils/jsonresponse.js";
import getDataUri from "../utils/dataUri.js";
import uploadImg from "../config/cloudinary.js";
import Consultation from "../models/Consultation.js";
import Errorhandler from "../utils/errorhandler.js";

export const addPrescription = async (req, res) => {
    const file = req.file;
    const fileUrl = getDataUri(file);
    try {
        // console.log("Cloudinary config:", cloudinary.config());

        
        const imageUrl = await uploadImg(fileUrl.content);
        console.log(imageUrl);
        
        return respond(res, 200, "Prescription Uploaded", imageUrl);
    } catch (uploadErr) {
        console.error(uploadErr)
        console.error("Cloudinary upload failed:", uploadErr.message);
        return res.status(500).json({ success: false, message: uploadErr.message });
    }
    
};

export const getPrescription = async (req, res, next) => {
    try {
        const id = req.params.id;

        let consultation = await Consultation.find({appointment : id})
            .populate("prescription")
            .populate("patient")
            .populate("case");
        consultation = consultation[0];
        
        if (!consultation) {
            return next(new Errorhandler("Consultation not found", 404));
        }

        if (!consultation.prescription) {
            return next(
                new Errorhandler("Prescription not found in consultation", 404)
            );
        }

        if (!consultation.patient || !consultation.case) {
            return next(
                new Errorhandler("Associated patient or case not found", 404)
            );
        }

        const prescriptionReply = {
            imageUrl: consultation.prescription.imageUrl || null,
            patientName: consultation.patient.username || "Unknown Patient",
            caseNumber: consultation.case.case_number || "Unknown Case Number",
            date: consultation.date || null,
        };

        return respond(
            res,
            200,
            "Prescription found successfully",
            prescriptionReply
        );
    } catch (error) {
        return next(
            new Errorhandler(error.message || "Internal Server Error", 500)
        );
    }
};

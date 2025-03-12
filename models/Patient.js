// models/Patient.js
import User from "./User.js";
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    phone: { type: String, default: null },
    address: { type: String, default: null },
    medicalHistory: { type: [String], default: [] },
});

// Export both models
export const Patient = User.discriminator("Patient", patientSchema); // Capitalize discriminator name
export { User };

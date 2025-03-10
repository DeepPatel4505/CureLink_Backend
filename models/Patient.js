import mongoose from "mongoose";
import { User } from "./User.js";

const patientSchema = new mongoose.Schema({
    phone: { type: String, default: null },
    address: { type: String, default: null },
    medicalHistory: { type: [String], default: [] },
});

export const Patient = User.discriminator("patient", patientSchema);

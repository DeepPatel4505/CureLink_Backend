// models/Patient.js
import User from "./User.js";
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const patientSchema = new mongoose.Schema({
    phone: {
        type: String,
        default: null,
        match: /^[0-9]{10,15}$/, // Basic phone number validation
    },
    address: {
        type: String,
        default: null,
    },
    medicalHistory: {
        type: [String],
        default: [],
    },
    allergies: {
        type: [String],
        default: [],
    },
    age: {
        type: Number,
    }, 
    gender: {
        type: String,
        enum: ["male", "female", "other",null],
        default:null
    },
    blood_group: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        default: null,
    },
    emergency_contact: {
        type: String,
        match: /^[0-9]{10,15}$/, // emergency number validation
    },
    emergency_contact_name: {
        type: String,
        default: null,
    },
    insurance_info: {
        provider: { type: String, default: null },
        policy_number: { type: String, default: null },
        valid_till: { type: Date, default: null },
    },
});

// Export both models
patientSchema.plugin(mongoosePaginate);
export const Patient = User.discriminator("Patient", patientSchema);
export { User };

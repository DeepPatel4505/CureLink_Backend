import mongoose from 'mongoose';
import User from './User.js';

const doctorSchema = new mongoose.Schema({
    specialization: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    experience: { type: Number, required: true }
});

const Doctor = User.discriminator('doctor', doctorSchema);
export default Doctor;

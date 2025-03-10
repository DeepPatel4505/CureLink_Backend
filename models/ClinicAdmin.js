import mongoose from "mongoose";
import User from "./User";

const clinicAdminSchema = new mongoose.Schema({
    clinicName: { type: String, required: true },
    clinicAddress: { type: String, required: true }
});

const ClinicAdmin = User.discriminator("clinic_admin", clinicAdminSchema);
export default ClinicAdmin;

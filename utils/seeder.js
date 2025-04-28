import Receptionist from "../models/Receptionist.js"
import Doctor from "../models/Doctor.js";
import bcrypt from "bcrypt";

export const seedReceptionist = async () => {
    try {
        const existingReceptionist = await Receptionist.findOne({ email: "receptionist@curelink.com" });
        if (existingReceptionist) {
            console.log("Receptionist already exists");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("12345678", salt);
        const receptionist = new Receptionist({
            username: "receptionist1",
            email: "receptionist@curelink.com",
            password: hashedPassword,
            phone: 1234567890,
        });

        await receptionist.save();
        console.log("Receptionist seeded successfully");
    } catch (error) {
        console.error("Error seeding receptionist:", error);
    }
};

export const seedDoctor = async () => {
    try {
        const existingDoctor = await Doctor.findOne({ email: "doctor@curelink.com" });
        if (existingDoctor) {
            console.log("Doctor already exists");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("securepassword", salt);
        const doctor = new Doctor({
            username: "doctor1",
            email: "doctor@curelink.com",
            password: hashedPassword,
            specialization: "Cardiology",
            licenseNumber: "DOC12345",
            experience: 10,
        });

        await doctor.save();
        console.log("Doctor seeded successfully");
    } catch (error) {
        console.error("Error seeding doctor:", error);
    }
};

export const seedData = async () => {
    await seedReceptionist();
    await seedDoctor();
};

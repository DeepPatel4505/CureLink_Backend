import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { Patient } from "../models/Patient.js";

const router = express.Router();

// Get logged-in user details
router.get("/profile", isAuthenticated, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json(req.user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/profile", isAuthenticated, async (req, res) => {
    try {
        const { username, email, phone, address, medicalHistory,bloodGroup,gender,age } = req.body;

        // Find the user by ID (from the authenticated request)
        const user = await Patient.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Update user fields
        user.username = username || user.username;
        user.age = age || user.age;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.medicalHistory = medicalHistory || user.medicalHistory;
        user.blood_group = bloodGroup || user.blood_group;
        user.gender = gender.toLowerCase() || user.gender;


        // Save the updated user
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
});




export default router;

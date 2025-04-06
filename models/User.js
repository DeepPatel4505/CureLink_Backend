import { Schema, model } from "mongoose";

const userSchema = Schema(
    {
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: function () {
                return !this.googleId; // If googleId is absent, password is required
            },
        },
        role: {
            type: String,
            enum: ["patient", "receptionist", "doctor", "admin"],
            required: true,
            default: "patient",
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        is_active:{
            type : Boolean,
            default : true
        }
    },
    {
        timestamps: true,
        discriminatorKey: "role",
    }
);

const User = model("User", userSchema);
export default User
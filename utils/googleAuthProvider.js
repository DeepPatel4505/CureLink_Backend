import "../config/config.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { Patient } from "../models/Patient.js";

export const connectPassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URI,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    let user = await User.findOne({ email });

                    if (user) {
                        // Update googleId if it's missing
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // Sanitize gender

                    // Create new patient (username can be duplicate)
                    const newPatient = new Patient({
                        googleId: profile.id,
                        username: profile.displayName,
                        email,
                    });

                    await newPatient.save();
                    return done(null, newPatient);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};

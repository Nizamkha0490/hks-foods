
import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const verifyUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const email = "HKSfoods087@gmail.com";
        const admin = await Admin.findOne({ email }).select("+password");

        if (admin) {
            console.log(`User found: ${admin.username}`);
            console.log(`Email: ${admin.email}`);
            console.log(`Role: ${admin.role}`);

            // Check password manually if needed, but for now just existence
            const match = await admin.comparePassword("kamraN@12");
            console.log(`Password match: ${match}`);
        } else {
            console.log("User NOT found");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

verifyUser();

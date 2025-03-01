import mongoose from 'mongoose';
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();  

// Cloudinary Configuration
cloudinary.config({  
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



// Connect MongoDB
const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI, {
        });
        console.log(`✅ Database Connected: ${connect.connection.host}`);
    } catch (error) {
        console.error("❌ Database Connection Error:", error);
        process.exit(1);  // Exit process on failure
    }
};

export default connectDB;

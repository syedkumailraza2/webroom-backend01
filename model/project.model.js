import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        imageUrl: { type: String, required: true },  // ✅ Store image URL
        cloudinaryId: { type: String, required: true },  // ✅ Store Cloudinary ID
        projectUrl: { type: String, required: true }  // ✅ New field for Project URL
    },
    { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;

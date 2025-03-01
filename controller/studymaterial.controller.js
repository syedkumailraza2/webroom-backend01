import Studymaterial from '../model/studymaterial.model.js';
import cloudinary from 'cloudinary';
import dotenv from "dotenv";

dotenv.config();


// ✅ Upload Study Material
export const uploadStudyMaterial = async (req, res) => {
    try {
        console.log("🔹 Request Body:", req.body);
        console.log("🔹 Received File:", req.file);

        const { name, format, tech, author, course, year, type } = req.body;

        if (!name || !format || !tech || !author || !course || !year || !type || !req.file) {
            return res.status(400).json({ message: "All fields (name, format, tech, author, course, year, type, file) are required!" });
        }

        const result = req.file.filename;

        const newMaterial = new StudyMaterial({
            name,
            format,
            url: `http://localhost:3000/public/temp/${result}`,
            tech,
            author,
            course,
            year,
            type
        });

        await newMaterial.save();
        res.status(201).json({ message: "Study material uploaded successfully", data: newMaterial });

    } catch (error) {
        console.error("❌ Error uploading file:", error);
        res.status(500).json({ message: "Error uploading study material", error: error.message });
    }
};

// ✅ Get All Study Materials
export const getAllStudyMaterials = async (req, res) => {
    try {
        const materials = await StudyMaterial.find();
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving study materials", error: error.message });
    }
};

// ✅ Get a Single Study Material by ID
export const getStudyMaterialById = async (req, res) => {
    try {
        const material = await StudyMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ message: "Study material not found" });

        res.status(200).json(material);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving study material", error: error.message });
    }
};

// ✅ Update Study Material (Including File Replacement)
export const updateStudyMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const existingMaterial = await StudyMaterial.findById(id);
        if (!existingMaterial) return res.status(404).json({ message: "Study material not found" });

        let fileUrl = existingMaterial.url;

        if (req.file) {
            // Extract the public ID from the URL
            const result = req.file.filename;
            fileUrl = `http://localhost:3000/public/temp/${result}`
        }

        const updatedMaterial = await StudyMaterial.findByIdAndUpdate(
            id, 
            { ...req.body, url: fileUrl }, 
            { new: true }
        );

        res.status(200).json({ message: "Study material updated successfully", data: updatedMaterial });
    } catch (error) {
        res.status(500).json({ message: "Error updating study material", error: error.message });
    }
};

// ✅ Delete Study Material (Fixes Cloudinary Resource Type Issue)
export const deleteStudyMaterial = async (req, res) => {
    try {
        const { id } = req.params;

        const material = await StudyMaterial.findById(id);
        if (!material) return res.status(404).json({ message: "Study material not found" });

        const fileUrl = material.url;
        const publicId = fileUrl.split('/').slice(-1)[0].split('.')[0];

        // 🔹 Determine the correct resource type
        let resourceType = "raw"; // Default for PDFs and documents
        if (material.type.startsWith("image")) resourceType = "image";
        if (material.type.startsWith("video")) resourceType = "video";

        // 🔹 Delete file from Cloudinary
        await cloudinary.v2.uploader.destroy(publicId, { resource_type: resourceType });

        // 🔹 Remove the study material from the database
        await StudyMaterial.findByIdAndDelete(id);

        res.status(200).json({ message: "Study material deleted successfully" });

    } catch (error) {
        console.error("❌ Error deleting study material:", error);
        res.status(500).json({ message: "Error deleting study material", error: error.message });
    }
};

// ✅ Search Study Materials
export const searchStudyMaterials = async (req, res) => {
    try {
        const { query, format, year } = req.query;

        const searchCriteria = {};
        if (query) {
            searchCriteria.$or = [
                { name: { $regex: query, $options: "i" } },
                { tech: { $regex: query, $options: "i" } },
                { author: { $regex: query, $options: "i" } },
                { course: { $regex: query, $options: "i" } },
                { year: { $regex: query, $options: "i" } },
                { type: { $regex: query, $options: "i" } }
            ];
        }
        if (format) searchCriteria.format = format;
        if (year) searchCriteria.year = year;

        const materials = await StudyMaterial.find(searchCriteria);
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ message: "Error searching study materials", error: error.message });
    }
};

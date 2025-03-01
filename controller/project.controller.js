import Project from "../model/project.model.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// ✅ Multer Middleware (Memory Storage for File Uploads)
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// ✅ Create a New Project (Uploads Image to Cloudinary)
export const createProject = async (req, res) => {
    try {
        const { title, description, projectUrl } = req.body;
        if (!title || !description || !projectUrl || !req.file) {
            return res.status(400).json({ message: "Title, description, project URL, and image are required" });
        }

        // Upload image to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ folder: "projects" }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
            uploadStream.end(req.file.buffer);
        });

        // Save project to database
        const newProject = await Project.create({
            title,
            description,
            imageUrl: result.secure_url,
            cloudinaryId: result.public_id,
            projectUrl  // ✅ Store Project URL
        });

        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get All Projects
export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get a Single Project by ID
export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Update a Project (Updates title, description, project URL, and optionally the image)
export const updateProject = async (req, res) => {
    try {
        const { title, description, projectUrl } = req.body;
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Upload new image if provided
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ folder: "projects" }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                uploadStream.end(req.file.buffer);
            });

            // Delete old image from Cloudinary
            if (project.cloudinaryId) {
                await cloudinary.uploader.destroy(project.cloudinaryId);
            }

            project.imageUrl = result.secure_url;
            project.cloudinaryId = result.public_id;
        }

        project.title = title || project.title;
        project.description = description || project.description;
        project.projectUrl = projectUrl || project.projectUrl;  // ✅ Allow updating Project URL
        await project.save();

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Delete a Project (Removes from DB and Deletes Image from Cloudinary)
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Delete image from Cloudinary
        if (project.cloudinaryId) {
            await cloudinary.uploader.destroy(project.cloudinaryId);
        }

        await project.deleteOne();
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

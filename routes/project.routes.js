import express from "express";
import { upload, createProject, getAllProjects, getProjectById, updateProject, deleteProject } from "../controller/project.controller.js";

const router = express.Router();

router.post("/", upload.single("image"), createProject);
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.put("/:id", upload.single("image"), updateProject);
router.delete("/:id", deleteProject);

export default router;

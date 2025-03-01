import express from "express";
import { addEvent, updateEvent, deleteEvent, getEvents } from "../controller/event.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const eventRoutes = express.Router();

eventRoutes.get('/',getEvents)
eventRoutes.post("/add-event", upload.fields([{ name: "poster", maxCount: 1 }, { name: "brochure", maxCount: 1 }]), addEvent);
eventRoutes.post("/update-event/:id", upload.fields([{ name: "poster", maxCount: 1 }, { name: "brochure", maxCount: 1 }]), updateEvent);
eventRoutes.delete("/:id", deleteEvent);


export default eventRoutes; 

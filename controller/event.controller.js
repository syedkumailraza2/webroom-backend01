import Event from "../model/event.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addEvent = async (req, res) => {
    try {
        // Get user input and validate
        const { name, date, description, register } = req.body;

        if (!name) return res.status(400).json({ message: "Name is Required" });
        if (!date) return res.status(400).json({ message: "Date is Required" });
        if (!description) return res.status(400).json({ message: "Description is Required" });
        if (!register) return res.status(400).json({ message: "Registration link is Required" });

        console.log("Received Files:", req.files); // Debugging line

        const poster = req.files?.poster[0]?.filename;
        const brochure = req.files?.brochure[0]?.filename;
        
        

        // Save event to DB
        const event = new Event({
            name,
            date,
            description,
            register,
            poster: `http://localhost:3000/public/temp/${poster}`,
            brochure: `http://localhost:3000/public/temp/${brochure}`
        });
        

        await event.save();

        console.log("Event Created:", event);
        return res.status(200).json({
            message: "Event added successfully!",
            event
        });

    } catch (error) {
        console.error(`Error while creating an Event: ${error}`);
        return res.status(500).json({ message: "Internal Server Error", error });
    }
};

const updateEvent = async (req, res) => {
    try {
        // Get user input and validate
        const { name, date, description, register } = req.body;

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        event.name = name || event.name;
        event.date = date || event.date;
        event.description = description || event.description;

        // Ensure files exist
        const posterBuff = req.files?.["poster"]?.[0]?.buffer;
        const brochureBuff = req.files?.["brochure"]?.[0]?.buffer;

        if(posterBuff){
            const poster = await uploadOnCloudinary(posterBuff, 'image');
            if (poster) event.poster = poster.secure_url;
        }

        if(brochureBuff){
            const brochure = await uploadOnCloudinary(brochureBuff, 'image');
            if(brochure) event.brochure = brochure.secure_url;
        }
        

        // Save event to DB
        
        await event.save();

        console.log("Event Created:", event);
        return res.status(200).json({
            message: "Event updated successfully!",
            event
        });

    } catch (error) {
        console.error(`Error while creating an Event: ${error}`);
        return res.status(500).json({ message: "Internal Server Error", error });
    }
};

const deleteEvent = async (req,res)=>{
    try {
        const eventId = req.params.id
        const event = await Event.findById(eventId)
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        //delete event
        await Event.deleteOne({"_id": eventId})
        
        //notify user
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.log("Error while Deleteing event");
        res.status(500).send({message:"Internal Server Error"});
    }
}

const getEvents = async (req,res)=>{
    try {
        const events = await Event.find()
        res.json(events);
    } catch (error) {
        console.log( "Error while getting Events ",error);
        res.status(500).send({message:"Internal Server Error"});
    }
}


export { addEvent, updateEvent, deleteEvent, getEvents };

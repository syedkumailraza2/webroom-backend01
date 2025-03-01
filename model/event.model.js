import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  brochure: { type:String, required:true },
  register: {type:String, required:true},
  poster: { type:String, required:true } 
}, { timestamps: true });

const Event = mongoose.model('Event', EventSchema);

export default Event;
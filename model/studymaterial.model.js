import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
    name: { type: String, required: true },  // Study material name
    format: { type: String, required: true },  // File format (PDF, Video, etc.)
    url: { type: String, required: true },  // Download URL
    tech: { type: String, required: true },  // Technology (React, Node.js, etc.)
    author: { type: String, required: true },  // Author name
    course: { type: String, required: true },  // Course name (BCA, etc.)
    year: { type: String, required: true },  // Year (3rd Year, etc.)
    type: { type: String, required: true },  // Type (Video, PDF, etc.)
}, { timestamps: true });

const Studymaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
export default Studymaterial;

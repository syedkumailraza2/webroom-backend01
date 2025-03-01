import express from 'express';
import {upload} from '../middleware/multer.middleware.js'
import { 
    uploadStudyMaterial, 
    getAllStudyMaterials, 
    getStudyMaterialById, 
    updateStudyMaterial, 
    deleteStudyMaterial,
    searchStudyMaterials
} from '../controller/studymaterial.controller.js';

const router = express.Router();

// Routes
router.post('/create', upload.single('url'), uploadStudyMaterial);
router.get('/', getAllStudyMaterials);
router.get('/search', searchStudyMaterials);
router.get('/:id', getStudyMaterialById);
router.put('/:id', upload.single('url'), updateStudyMaterial);
router.delete('/:id', deleteStudyMaterial);

export default router;

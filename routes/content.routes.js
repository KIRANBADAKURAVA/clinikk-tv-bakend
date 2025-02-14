import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js'
import {  
    createContent, 
    getAllContent, 
    getContentById, 
    deleteContent
} from '../controllers/content.controller.js';

import { Tokenverification } from '../middlewares/auth.middleware.js';

const ContentRouter = Router();

// Route to create new content 
ContentRouter.post('/uploadcontent', Tokenverification,  upload.fields([
    {
        name: 'contentFile',
        maxCount: 1
    }
]),createContent);

ContentRouter.get('/getallcontent',  getAllContent);

// Route to get content by ID 
ContentRouter.get('/contentbyid/:id',  getContentById);

// Route to delete content 
ContentRouter.delete('/content/:id', Tokenverification, deleteContent);

export default ContentRouter;

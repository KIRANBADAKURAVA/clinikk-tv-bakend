import { Router } from 'express';
import { 
    createPlaylist, 
    addContent 
} from '../controllers/playlist.controller.js';

import { Tokenverification } from '../middlewares/auth.middleware.js';

const PlaylistRouter = Router();

// Route to create a new playlist
PlaylistRouter.route('/create').post(Tokenverification, createPlaylist);

// Route to add content to a playlist
PlaylistRouter.route('/addcontent/:id').put(Tokenverification, addContent);

export default PlaylistRouter;

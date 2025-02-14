import {AsyncHandler} from '../utils/asynchandler.js'
import { Playlist } from "../models/playlists.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a Playlist
const createPlaylist = AsyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const playlist = await Playlist.create({
        name,
        description,
        createdBy: req.user._id,
        content: []
    });

    if (!playlist) {
        throw new ApiError(500, "Something went wrong while creating a new Playlist");
    }

    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

// Add Content to a Playlist
const addContent = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !id) {
        throw new ApiError(400, "Both content and playlist ID are required");
    }

    const playlist = await Playlist.findById(id);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Ensure content is an array and append the new content
    if (!Array.isArray(content)) {
        throw new ApiError(400, "Content must be an array of content IDs");
    }

    playlist.content.push(...content);
    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "Content added successfully"));
});

export {
    createPlaylist,
    addContent
};

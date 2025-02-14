import {AsyncHandler} from '../utils/asynchandler.js'
import { Content } from '../models/content.model.js';
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { fileupload, filedelete } from '../utils/cloudinary.js';

/**
 * @desc Create new content
 * @route POST /api/content
 * @access Private (Admin only)
 */
const createContent = AsyncHandler(async (req, res) => {
    const { title = "", description = "", contentType = "" } = req.body;

    // Checking whether the user is an Admin or not
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (!user.isAdmin) {
        throw new ApiError(403, "Unauthorized request");
    }

    const adminId = req.user._id;

    if (!req.files || !req.files.contentFile) {
        throw new ApiError(400, "File is required");
    }

    // Media file
    let contentLocalPath;
    
    if (Array.isArray(req.files.contentFile) && req.files.contentFile.length > 0) {
        contentLocalPath = req.files.contentFile[0].path;
    }

    if (!contentLocalPath) {
        throw new ApiError(400, "File is required");
    }

    const contentFilepath = await fileupload(contentLocalPath);
    const contentFile = contentFilepath?.url;

    if (!contentFile) {
        throw new ApiError(500, "Error while uploading content to cloud storage");
    }

    // Create content
    const content = await Content.create({
        admin: adminId,
        title,
        contentFile,
        description,
        contentType
    });

    // Fetch newly created content (excluding timestamps)
    const createdContent = await Content.findById(content._id).select("-createdAt -updatedAt");

    if (!createdContent) {
        throw new ApiError(500, "Something went wrong while creating content");
    }

    return res.status(201).json(new ApiResponse(201, createdContent, "Content created successfully"));
});

/**
 * @desc Get all content
 * @route GET /api/content
 * @access Public
 */
const getAllContent = AsyncHandler(async (req, res) => {
    const contents = await Content.find().populate('admin', 'username email');
    
    
    if (!contents || contents.length === 0) {
        throw new ApiError(404, "No content found");
    }

    return res.status(200).json(new ApiResponse(200, contents, "Content retrieved successfully"));
});

/**
 * @desc Get content by ID
 * @route GET /api/content/:id
 * @access Public
 */
const getContentById = AsyncHandler(async (req, res) => {
    const { id } = req.params;

    const content = await Content.findById(id).populate('admin', 'username email');

    if (!content) {
        throw new ApiError(404, "Content not found");
    }

    return res.status(200).json(new ApiResponse(200, content, "Content retrieved successfully"));
});

/**
 * @desc Delete content by ID
 * @route DELETE /api/content/:id
 * @access Private (Admin only)
 */
const deleteContent = AsyncHandler(async (req, res) => {
    const { id } = req.params;

    const content = await Content.findById(id);

    if (!content) {
        throw new ApiError(404, "Content not found");
    }

    if (String(content.admin) !== String(req.user._id)) {
        throw new ApiError(403, "Unauthorized request");
    }

    await filedelete(content.contentFile);
    await content.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, "Content deleted successfully"));
});

// Export all controllers
export { createContent, getAllContent, getContentById, deleteContent };

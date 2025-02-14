import { AsyncHandler } from "../utils/Asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";

// User registration
const userRegistration = AsyncHandler(async (req, res) => {
    const { username = "", email = "", password = "", fullName = "", isAdmin = false } = req.body;

    if ([username, email, password, fullName].some((item) => item?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        isAdmin
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Error registering the user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// Generate Access and Refresh Tokens
const AccessAndRefreshTokenGenerator = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

// User login
const loginUser = AsyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
        console.log(req.body)
    if (!username && !email) {
        throw new ApiError(400, "Either username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) throw new ApiError(404, "User does not exist");

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid username or password");
    }

    const { accessToken, refreshToken } = await AccessAndRefreshTokenGenerator(user._id);

    const loggedUser = await User.findById(user._id).select("-password -refreshToken");

    const options = { httpOnly: true, secure: true };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedUser, refreshToken, accessToken }, "User logged in successfully"));
});

// User logout
const logoutUser = AsyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

    const options = { httpOnly: true, secure: true };

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// Toggle Subscription

const toggleSubscription = AsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Find the subscription record for the user
    let subscription = await Subscription.findOne({ user: user._id });

    if (!subscription) {
        // Create a new subscription record if not found
        subscription = await Subscription.create({
            user: user._id,
            isSubscribed: true, // Set to true as default if newly created
            subscriptionType: "basic" // You may customize this
        });
    } else {
        // Toggle the subscription status
        subscription.isSubscribed = !subscription.isSubscribed;
        await subscription.save();
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isSubscribed: subscription.isSubscribed,
                subscriptionType: subscription.subscriptionType
            },
            "Subscription status toggled successfully"
        )
    );
});


// Get current user
const getCurrentUser = AsyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User data fetched successfully"));
});

// Change password
const updatePassword = AsyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(500, "Error finding user");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password updated successfully"));
});

// Update account details
const updateAccountDetails = AsyncHandler(async (req, res) => {
    const { username, fullName } = req.body;

    if (!username && !fullName) {
        throw new ApiError(400, "At least one field is required");
    }

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
        throw new ApiError(500, "Error finding user");
    }

    if (username) user.username = username;
    if (fullName) user.fullName = fullName;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

// Get watch history
const getWatchHistory = AsyncHandler(async (req, res) => {
    const user = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.user._id) } },
        { $lookup: {
            from: "contents",
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchHistory",
            pipeline: [
                { $lookup: {
                    from: "users",
                    localField: "admin",
                    foreignField: "_id",
                    as: "admin",
                    pipeline: [{ $project: { fullName: 1, username: 1 } }]
                } },
                { $addFields: { owner: { $first: "$admin" } } }
            ]
        }}
    ]);

    return res.status(200).json(new ApiResponse(200, user[0]?.watchHistory || [], "Watch history fetched successfully"));
});

export {
    userRegistration,
    loginUser,
    logoutUser,
    updatePassword,
    getCurrentUser,
    updateAccountDetails,
    getWatchHistory,
    toggleSubscription
};

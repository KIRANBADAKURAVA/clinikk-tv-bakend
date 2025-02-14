import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// User Schema
const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            trim: true 
        },
        fullName: {
            type: String,
            required: true,
            index: true
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Content' 
            }
        ],
        refreshToken: {
            type: String
        }
    },
    { timestamps: true }
);

// Password encryption middleware
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Encrypt only if password is modified

    const encryptedPassword = await bcrypt.hash(this.password, 10);
    this.password = encryptedPassword;

    next();
});

// Password verification method
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate access token
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

// Generate refresh token
UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

// Export User model
export const User = mongoose.model('User', UserSchema);

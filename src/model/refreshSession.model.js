import mongoose, { model, Schema } from "mongoose";

const refreshSessionSchema = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        index: true,
    },

    sessionId: {
        type: String,
        trim: true,
        unique: true,
    },

    tokenHash: {
        type: String,
        trim: true,
        unique: true,
    },

    device: {
        browser: {
            type: String,
            trim: true,
        },
        os: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            trim: true,
        },

    },

    userAgent: {
        type: String,
        trim: true,
    },

    lastUsedAt: {
        type: Date,
    },

    expiresAt: {
        type: Date,
    },

    absoluteExpiresAt: {
        type: Date,
    },

    revokedAt: {
        type: Date,
        index: true,
    },

    parentTokenId: {
        type: mongoose.Types.ObjectId,
    },

    replacedByTokenId: {
        type: mongoose.Types.ObjectId,
    }


}, {timestamps: true})

const RefreshSessionModel = model("RefreshSession", refreshSessionSchema);
export default RefreshSessionModel;
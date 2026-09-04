import { model, Schema } from "mongoose";

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },

    password: {
        type: String,
        required: true,
        // minLength: 8,
        // maxLength: 30,
    },

    role: {
        type: String,
        enum: ["candidate", "interviewer"],
        required: true,
    },

    isActive: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

const UserModel = model("User", userSchema);
export default UserModel;
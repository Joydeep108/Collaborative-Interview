import { model, Schema } from "mongoose";

const interviewerSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },

    name: {
        type: String,
        required: true,
        trim: true,
    },

    mobileNumber: {
        type: String,
        required: true,
        trim: true,
    },

    profilePhoto: {
        url: String,
        publicId: String,
    },

    designation: {
        type: String,
        trim: true,
    },

}, { timestamps: true });

const InterviewerModel = model("Interviewer", interviewerSchema);
export default InterviewerModel;
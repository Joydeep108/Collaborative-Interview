import mongoose, {model, Schema} from "mongoose";
import CandidateModel from "./candidate.model";
import InterviewerModel from "./interviewer.model";
import InterviewRoomModel from "./room.model";

const interviewSchema = new Schema({
    candidateId: {
        type: Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
    },

    interviewerId: {
        type: Schema.Types.ObjectId,
        ref: "Interviewer",
        required: true,
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },

    description: {
        type: String,
        trim: true,
        maxlength: 5000,
    },

    scheduledAt: {
        type: Date,
        required: true,
    },

    durationMinutes: {
        type: Number,
        required: true,
        min: 1,
        max: 480,
    },

    status: {
        type: String,
        enum: [
            "DRAFT",
            "SCHEDULED",
            "WAITING",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED"
        ],
        default: "DRAFT",
    },

}, { timestamps: true });


const InterviewModel = model("Interview", interviewSchema);
export default InterviewModel;
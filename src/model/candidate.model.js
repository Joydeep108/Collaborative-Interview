import { model, Schema } from "mongoose";

const candidateSchema = new Schema({
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

    resume: {
        url: String,
        publicId: String,
    },

    skills: [{
        type: String,
        trim: true,
    }],

    experienceYears: {
        type: Number,
        min: 0,
        default: 0,
    },

}, { timestamps: true });


const CandidateModel = model("Candidate", candidateSchema);
export default CandidateModel;


import { model, Schema } from "mongoose";

const interviewInvitationSchema = new Schema({
    interviewId: {
        type: Schema.Types.ObjectId,
        ref: "Interview",
        required: true,
    },

    candidateId: {
        type: Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
    },

    status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"],
        default: "PENDING",
    },

    invitedAt: {
        type: Date,
        default: Date.now,
    },

    respondedAt: {
        type: Date,
    },

}, { timestamps: true });

interviewInvitationSchema.index(
    { interviewId: 1, candidateId: 1 },
    { unique: true }
);

const InterviewInvitationModel = model("InterviewInvitation", interviewInvitationSchema);

export default InterviewInvitationModel;
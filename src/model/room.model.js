import { model, Schema } from "mongoose";

const interviewRoomSchema = new Schema({
    interviewId: {
        type: Schema.Types.ObjectId,
        ref: "Interview",
        required: true,
        unique: true,
    },

    roomCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        // uppercase: true,
    },

    status: {
        type: String,
        enum: [
            "WAITING",
            "ACTIVE",
            "CLOSED"
        ],
        default: "WAITING",
    },

}, { timestamps: true });

// interviewRoomSchema.index(
//     {roomCode: 1, interviewId: 1},
//     {unique: true}
// )

const InterviewRoomModel = model("InterviewRoom", interviewRoomSchema);
export default InterviewRoomModel;
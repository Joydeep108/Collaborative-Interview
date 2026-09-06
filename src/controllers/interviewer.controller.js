import CandidateModel from "../model/candidate.model.js";
import InterviewModel from "../model/interview.model.js";
import InterviewInvitationModel from "../model/interviewInvitation.model.js";
import UserModel from "../model/user.model.js";

export const createInterview = async (req, res) => {
    try {
        // console.log(req.jwtPayload);
        // don't do that way, use zod for it's fields values 
        // if(!req.body) {
        //     return res.status(400).json({message: "Required fields are missing."});
        // }

        const {candidateEmail, title, description, scheduledAt, durationMinutes} = req.body;
        // before marking status SCHEDULED, your backend should eventually validate that 
        // scheduledAt is a valid future date. That belongs in your Zod/business validation, 
        // not in the frontend.
        const status = scheduledAt ? "SCHEDULED" : "DRAFT";

        // here zod verification works, I implement it letter.
        const {_id: userId} = await UserModel.findOne({email: candidateEmail});
        if(!userId) {
            return res.status(404).json({message: "Candidate not found"});
        }

        const {interviewerId} = req.jwtPayload;

        const candidate =  await CandidateModel.findOne({userId});
        console.log(candidate);
        if(!candidate) {
            return res.status(404).json({message: "Candidate not found"});
        }

        const interviewDetailsPayload = {
            candidateId: candidate._id,
            interviewerId: interviewerId,
            title,
            description,
            scheduledAt,
            durationMinutes,
            status
        }

        const interviewDetails = await InterviewModel.create(interviewDetailsPayload);

        const sendInvitaionPayload = {
            interviewId: interviewDetails._id,
            candidateId: candidate._id,
        }

        await InterviewInvitationModel.create(sendInvitaionPayload);

        // now here to send notification or response to the user that your interview invitaions is send
        // here also I send the "invitations-id", "interview-id"
        // I have to implement websocket, I do it letter.

        res.status(201).json({message: "Invitation send successfully"});

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}
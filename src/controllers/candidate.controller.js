import InterviewInvitationModel from "../model/interviewInvitation.model.js";

export const getAllInterviewInvitaions = async (req, res) => {
    try {
        const {candidateId} = req.jwtPayload;

        const interviewInvitations = await InterviewInvitationModel.find(candidateId).lean();
        if(interviewInvitations.length === 0) {
            return res.status(404).json({message: "There is no invitaions right now."});
        }

        res.status(200).json({
            message: "Inivations are find successfully",
            invitations: interviewInvitations
        })

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}

export const acceptInvitaions = async (req, res) => {
    try {
        const {interviewId} = req.body;

        // similarly here also I check the user input via zod validations letter.

        const {candidateId} = req.jwtPayload;
        const invitaions = await InterviewInvitationModel.findOneAndUpdate({candidateId, interviewId, status: "PENDING"}, {status: "ACCEPTED", respondedAt: new Date()});

        if(!invitaions) {
            return res.status(404).json({
                message: "Invitation not found or already responded."
            });
        }

        res.status(201).json({message: "Your interview is successfully scheduled."});

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}

export const rejectInvitaions = async (req, res) => {
    try {
        const {id: invitationId} = req.params;
        const {interviewId} = req.body;

        // similarly here also I check the user input via zod validations letter.

        const {candidateId} = req.jwtPayload;
        const invitaions = await InterviewInvitationModel.findOneAndUpdate(
            {
                _id: invitationId,
                candidateId, 
                interviewId, 
                status: "PENDING"}, 
            {
                $set: {
                    status: "REJECTED", respondedAt: new Date()
                }
            });

        if(!invitaions) {
            return res.status(404).json({
                message: "Invitation not found or already responded."
            });
        }

        res.status(201).json({message: "You reject the interview successfully."});

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}


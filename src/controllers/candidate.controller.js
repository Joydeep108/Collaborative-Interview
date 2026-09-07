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

        // similarly here also I check the user input via zod validations letter.

        const {candidateId} = req.jwtPayload;
        const invitaions = await InterviewInvitationModel.findOneAndUpdate(
            {
                _id: invitationId,
                candidateId, 
                interviewId, 
                status: "PENDING"
            }, 
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

export const joinRoomByCandidate = async (req, res) => {
    try {
        const { roomId, interviewInvitaionId } = req.body;
        // here we include the zod validation for the required field

        // candidateId is required because, a candidate don't join to the another candidate room 
        // via uploading the roomId of another candidate.
        const { candidateId } = req.jwtPayload;

        const invitaionDetails = await InterviewInvitationModel.findOne(
            {
                _id: interviewInvitaionId,
                candidateId,
                status: "ACCEPTED",
            },
        )   

        if(!invitaionDetails) {
            return  res.status(403).json({message: "Invitations is not accepted by you."});
        }

        const roomDetails = await InterviewRoomModel.findOne(
            {
                _id: roomId,
                status: "WAITING"
            }
        );

        if(!roomDetails) {
            return res.status(404).json({message: "Room is not found."});
        }

        const interviewDetails = await InterviewModel.findOne(
            {
                _id: roomDetails.interviewId,
                status: "WAITING"
            }
            
        );

        if(!interviewDetails) {
            return res.status(404).json({message: "Interview id is not found."});
        }

        res.status(200).json({message: "Joining to the room is successfull."}); 

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}

export const leaveRoomByCandidate = async (req, res) => {
    try {
        const { roomId, interviewInvitaionId } = req.body;
        const { candidateId } = req.jwtPayload;

        const invitaionDetail = await InterviewInvitationModel.findOne(
            {
                _id: interviewInvitaionId,
                candidateId,
                status: "ACCEPTED",
            },
        )

        if(!invitaionDetail) {
            return  res.status(403).json({message: "Invitations is not accepted by candidate."});
        }

        // 1. interveiw room is in active state or not
        const roomDetails = await InterviewRoomModel.findOne(
            {
                _id: roomId,
                status: "ACTIVE"
            }
        );

        if(!roomDetails) {
            return res.status(404).json({message: "Room is not found."});
        }

        // 2. Interview status is "IN_PROGRESS" or not
        const interviewDetails = await InterviewModel.findOne(
            {
                _id: roomDetails.interviewId,
                status: "IN_PROGRESS"
            }
            
        );

        if(!interviewDetails) {
            return res.status(404).json({message: "Interview id is not found."});
        }

        res.status(201).json({message: "Interview is completed."});


    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}
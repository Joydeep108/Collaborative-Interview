import CandidateModel from "../model/candidate.model.js";
import InterviewModel from "../model/interview.model.js";
import InterviewInvitationModel from "../model/interviewInvitation.model.js";
import InterviewRoomModel from "../model/room.model.js";
import UserModel from "../model/user.model.js";
import crypto from 'crypto';


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
        const user = await UserModel.findOne({
            email: candidateEmail,
            role: "candidate"
        });

        if (!user) {
            return res.status(404).json({ message: "Candidate not found." });
        }

        const candidate = await CandidateModel.findOne({ userId: user._id });

        if(!candidate) {
            return res.status(404).json({message: "Candidate not found"});
        }

        const {interviewerId} = req.jwtPayload;

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

        const invitationsDetails = await InterviewInvitationModel.create(sendInvitaionPayload);

        const createRoomPaylod = {
            interviewId: interviewDetails._id,
            roomCode: crypto.randomUUID(),
        }

        const roomDetails = await InterviewRoomModel.create(createRoomPaylod);

        // now here to send notification or response to the user that your interview invitaions is send
        // here also I send the "invitations-id", "interview-id"
        // I have to implement websocket, I do it letter.

        const responsePayload = {
            interviewId: invitationsDetails.interviewId,
            candidateId: invitationsDetails.candidateId,
            interviewScheduledAt: interviewDetails.scheduledAt,
            interviewTitle: interviewDetails.title,
            interviewStatus: interviewDetails.status,
            invitationStatus: invitationsDetails.status,
            invitedAt: invitationsDetails.invitedAt,
            roomCode: roomDetails.roomCode,
            roomStatus: roomDetails.status
        }

        res.status(201).json({
            message: "Invitation send successfully",
            interviewInfo: responsePayload,
        });

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}

export const createInterviewNow = async (req, res) => {
    try {
        const {candidateEmail, title, description, durationMinutes, status} = req.body;

        // POST /interviews/now
        // Then the endpoint itself tells the backend this is an immediate interview.
        if(status.toLowerCase() !== "now") {
            return res.status(400).json({message: "Bad request."});
        }

        const {_id: userId} = await UserModel.findOne({email: candidateEmail});
        if(!userId) {
            return res.status(404).json({message: "Candidate not found"});
        }

        const {interviewerId} = req.jwtPayload;

        const candidate =  await CandidateModel.findOne({userId});
        // console.log(candidate);
        if(!candidate) {
            return res.status(404).json({message: "Candidate not found"});
        }

        const interviewDetailsPayload = {
            candidateId: candidate._id,
            interviewerId: interviewerId,
            title,
            description,
            scheduledAt: new Date(),
            durationMinutes,
            status: "WAITING"
        }

        const interviewDetails = await InterviewModel.create(interviewDetailsPayload);

        const sendInvitaionPayload = {
            interviewId: interviewDetails._id,
            candidateId: candidate._id,
        }

        await InterviewInvitationModel.create(sendInvitaionPayload);

        const createRoomPaylod = {
            interviewId: interviewDetails._id,
            roomCode: crypto.randomUUID(),
        }

        await InterviewRoomModel.create(createRoomPaylod);

        res.status(201).res({message: "Join to the room is successfull."});
        // we show the interviewer frontend part.

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}


export const joinRoomByInterviewer = async (req, res) => {
    try {
        // I'm using interviewInvitaionId becauser searching should be easy
        // because mongodb automatically include the indexing on _ids'
        const { roomId, interviewInvitaionId } = req.body;
        // here we include the zod validation for the required field

        const { interviewerId } = req.jwtPayload;

        const invitaionDetails = await InterviewInvitationModel.findOne(
            {
                _id: interviewInvitaionId,
                status: "ACCEPTED",
            },
        )

        if(!invitaionDetails) {
            return  res.status(403).json({message: "Invitations is not accepted by candidate."});
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
                interviewerId,
                status: "WAITING"
            }
            
        );

        if(!interviewDetails) {
            return res.status(404).json({message: "Interview id is not found."});
        }

        res.status(200).json({message: "Room joining is successfull."});

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}

export const startInterview = async (req, res) => {
    try {
        const { roomId, interviewInvitaionId } = req.body;
        const { interviewerId } = req.jwtPayload;

        const invitaionDetail = await InterviewInvitationModel.findOne(
            {
                _id: interviewInvitaionId,
                status: "ACCEPTED",
            },
        )

        if(!invitaionDetail) {
            return  res.status(403).json({message: "Invitations is not accepted by candidate."});
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
                interviewerId,
                status: "WAITING"
            }
            
        );

        if(!interviewDetails) {
            return res.status(404).json({message: "Interview id is not found."});
        }

        await InterviewModel.findByIdAndUpdate(
            {
                _id: roomDetails.interviewId
            }, 
            {
                $set: {
                    status: "IN_PROGRESS",
                    startedAt: new Date()
                }
            }
        )

        await InterviewRoomModel.findByIdAndUpdate(
            {
                _id: roomId,
            }, 
            {
                $set: {
                    status: "ACTIVE"
                }
            }
        )

        res.status(201).json({message: "Interview is started."});


        

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}

export const endInterviewByInterviewer = async (req, res) => {
    try {
        const { roomId, interviewInvitaionId } = req.body;
        const { interviewerId } = req.jwtPayload;

        const invitaionDetail = await InterviewInvitationModel.findOne(
            {
                _id: interviewInvitaionId,
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
                interviewerId,
                status: "IN_PROGRESS"
            }
            
        );

        if(!interviewDetails) {
            return res.status(404).json({message: "Interview id is not found."});
        }


        await InterviewModel.findByIdAndUpdate(
            {
                _id: roomDetails.interviewId
            }, 
            {
                $set: {
                    status: "COMPLETED",
                    endedAt: new Date()

                }
            }
        )

        await InterviewRoomModel.findByIdAndUpdate(
            {
                _id: roomId,
            }, 
            {
                $set: {
                    status: "CLOSED"
                }
            }
        )

        res.status(201).json({message: "Interview is completed."});

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}

export const cancleInterviewByInterviewer = async (req, res) => {
    try {
        const { roomId, interviewInvitaionId } = req.body;
        const { interviewerId } = req.jwtPayload;

        const invitaionDetail = await InterviewInvitationModel.findOne(
            {
                _id: interviewInvitaionId,
                status: "ACCEPTED",
            },
        )

        if(!invitaionDetail) {
            return  res.status(403).json({message: "Invitations is not accepted by candidate."});
        }

        const interviewDetails = await InterviewModel.findOne(
            {
                _id: invitaionDetail.interviewId,
                interviewerId,
                status: "SCHEDULED"
            }
            
        );

        if(!interviewDetails) {
            return res.status(404).json({message: "Interview id is not found."});
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

        await InterviewModel.findByIdAndUpdate(
            {
                _id: roomDetails.interviewId
            }, 
            {
                $set: {
                    status: "CANCELLED",
                }
            }
        )

        await InterviewRoomModel.findByIdAndUpdate(
            {
                _id: roomId,
            }, 
            {
                $set: {
                    status: "CLOSED"
                }
            }
        )

        res.status(201).json({message: "Interview cancled successfully."});
        

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}


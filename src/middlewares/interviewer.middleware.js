import InterviewerModel from "../model/interviewer.model.js";

const interviewerMiddleware = async (req, res, next) => { 
    try {
        const {id:userId, role} = req.jwtPayload;
        // console.log(req.jwtPayload)
        if (role !== "interviewer") {
            return res.status(403).json({
                message: "Interviewer access required."
            });
        }

        const interviewer = await InterviewerModel.findOne({ userId });

        if (!interviewer) {
            return res.status(404).json({
                message: "Interviewer profile not found."
            });
        }

        req.jwtPayload.interviewerId = interviewer._id;

        next();

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}

export default interviewerMiddleware;
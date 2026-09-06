import CandidateModel from "../model/candidate.model.js";

const candidateMiddleware = async (req, res, next) => { 
    try {
        const {id:userId, role} = req.jwtPayload;
        // console.log(req.jwtPayload)

        if (role !== "candidate") {
            return res.status(403).json({
                message: "Candidate access required."
            });
        }

        const candidate = await CandidateModel.findOne({ userId });

        if (!candidate) {
            return res.status(404).json({
                message: "Candidate profile not found."
            });
        }

        req.jwtPayload.candidateId = candidate._id;

        next();

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}

export default candidateMiddleware;
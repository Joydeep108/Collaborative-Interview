import jwt from "jsonwebtoken";
import UserModel from "../model/user.model.js";
import RefreshSessionModel from "../model/refreshSession.model.js";

const authMiddleware = async (req, res, next) => {
    try {
        const {accessToken} = req.cookies;
        
        if(!accessToken) {
            return res.status(401).json({message: "Unauthorized, Access denied."})
        }

        let jwtPayload;

        try {
            jwtPayload = jwt.verify(accessToken, process.env.JWT_SECRET);

        } catch(err) {
            return res.status(401).json({
                message: "Invalid or expired access token."
            });
        }

        // console.log(jwtPayload);

        const isUserExist = await UserModel.findById({_id: jwtPayload.id})

        // console.log(isUserExist);

        if(!isUserExist) {
            return res.status(401).json({message: "Unauthenticated user. Please log in."});
        }

        if(!isUserExist.isActive) {
            return res.status(403).json({message: "Please! log in again."});
        }

        const currentSession = await RefreshSessionModel.findOne(
            {
                sessionId: jwtPayload.sessionId,
                revokedAt: null,
                userId: jwtPayload.id
            }
        );

        if(!currentSession) {
            return res.status(401).json({
                message: "Session is no longer active. Please log in again."
            });
        }

        // console.log(currentSession);

        req.jwtPayload = { ...jwtPayload};

        next();
        // res.send("Hi, deployment is successfull");
    

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error."
        })
    }
}

export default authMiddleware;
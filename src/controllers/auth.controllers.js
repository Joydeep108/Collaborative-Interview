import CandidateModel from "../model/candidate.model.js";
import InterviewerModel from "../model/interviewer.model.js";
import RefreshSessionModel from "../model/refreshSession.model.js";
import UserModel from "../model/user.model.js";
import { signupSchema } from "../validators/auth.validator.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { access } from "fs";


export const signup = async (req, res) => {
    try {
        // const result = signupSchema.safeParse(req.body);
        // if (!result.success) {
        //     return res.status(400).json({ message: result.error.issues[0].message })
        // }

        const deviceInfo = req.useragent;
        const payload = req.body;

        const isUserExist = await UserModel.findOne({email: payload.email});
        console.log(isUserExist);
        if(isUserExist) {
            return res.status(409).json({message: "User is already exist, Please! login."})
        }

        const hashPassword = await bcrypt.hash(payload.password, 10);
        const user = await UserModel.create({
            email: payload.email,
            password: hashPassword,
            role: payload.role,
        });
        console.log(user);

        
        if(payload.role === "candidate") {
            const candidatePayload = {
                userId: user._id,
                name: payload.name,
                mobileNumber: payload.mobileNumber,
                profilePhoto: payload?.profilePhoto,
                resume: payload?.resume,
                skills: [...payload?.skills],
                experienceYears: payload?.experienceYears,
            }

            await CandidateModel.create(candidatePayload);
        }

        if(payload.role === "interviewer") {
            const interviewerPayload = {
                userId: user._id,
                name: payload.name,
                mobileNumber: payload.mobileNumber,
                profilePhoto: payload?.profilePhoto,
                designation: payload?.designation,
            }

            await InterviewerModel.create(interviewerPayload);
        }

        const refreshToken = crypto.randomBytes(64).toString("base64url");
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const sessionId = crypto.randomUUID();

        const accessTokenPayload = {
            id: user._id,
            email: user.email,
            role: user.role, 
            sessionId
        }

        const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, {expiresIn: "15m"});

        // 1. Calculate 30 days from now
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        // 2. Calculate 90 days from now
        const absoluteExpirationDate = new Date();
        absoluteExpirationDate.setDate(absoluteExpirationDate.getDate() + 90);

        const refreshSessionPayload = {
            userId: user._id,
            sessionId,
            tokenHash: refreshTokenHash,
            device: {
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                type: deviceInfo.platform   
            },
            userAgent: deviceInfo.source,
            lastUsedAt: Date.now(),
            expiresAt: expirationDate,
            absoluteExpiresAt: absoluteExpirationDate,
            revokedAt: null,
            parentTokenId: null,
            replacedByTokenId: null,
        }

        await RefreshSessionModel.create(refreshSessionPayload);
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: false,
            maxAge: 15*60*1000

        })
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: false,
            maxAge: 30*24*60*60*1000

        })

        res.status(201).json({
            message: `${user.role} created successfully`,
        })

    } catch(err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error." })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const deviceInfo = req.useragent;
        
        const user = await UserModel.findOne({email});
        if(!user) {
            return res.status(401).json({message: "Invalid credentials."});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(401).json({message: "Invalid credentials."});
        }

        const refreshToken = crypto.randomBytes(64).toString("base64url");
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const sessionId = crypto.randomUUID();

        const accessTokenPayload = {
            id: user._id,
            email: user.email,
            role: user.role, 
            sessionId
        }
        const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, {expiresIn: "15m"});

        // 1. Calculate 30 days from now
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        // 2. Calculate 90 days from now
        const absoluteExpirationDate = new Date();
        absoluteExpirationDate.setDate(absoluteExpirationDate.getDate() + 90);


        const refreshSessionPayload = {
            userId: user._id,
            sessionId,
            tokenHash: refreshTokenHash,
            device: {
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                type: deviceInfo.platform   
            },
            userAgent: deviceInfo.source,
            lastUsedAt: Date.now(),
            expiresAt: expirationDate,
            absoluteExpiresAt: absoluteExpirationDate,
            revokedAt: null,
            parentTokenId: null,
            replacedByTokenId: null,
        }

        await RefreshSessionModel.create(refreshSessionPayload);
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: false,
            maxAge: 15*60*1000

        })
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: false,
            maxAge: 30*24*60*60*1000

        })

        res.status(201).json({
            message: `${user.role} logged in successfully`,
        })

    } catch(err) {
        res.status(500).json({
            message: "Internal server error"
        })
    }

}   

export const logout = async (req, res) => {
    try {
        const {refreshToken} = req.cookies;
        
        if (!refreshToken) {
            return res.status(401).json({message: "Unauthorized user."});
        }

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex"); 
        const refreshSession = await RefreshSessionModel.findOne({tokenHash: refreshTokenHash});
        if(!refreshSession) {
            return res.status(400).json({message: "Bad request."});
        } 

        if(refreshSession.revokedAt !== null) {
            return res.status(400).json({message: "Bad request from revokedat."})
        }
        
        await RefreshSessionModel.findOneAndUpdate(
        { tokenHash: refreshTokenHash }, 
        { $set: { revokedAt: new Date() } }, 
        { returnDocument: 'after' }
        ); 
        
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.status(200).json({message: "Logout successfully."});


    } catch(err) {
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const refresh = async (req, res) => {
    try {
        const {accessToken, refreshToken} = req.cookies;

        if(accessToken) {
            return res.status(403).json({message: "Invalid request."})
        }

        if(!refreshToken) {
            return res.status(401).json({message: "Token is missing."});
        }

        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const oldRefreshSession = await RefreshSessionModel.findOne({tokenHash: refreshTokenHash});

        if(!oldRefreshSession) {
            return res.status(401).json({ message: "Invalid refresh token." });
        }

        // console.log(oldRefreshSession);

        // Detect revoked/reused token
        if (oldRefreshSession.revokedAt !== null) {

            if (oldRefreshSession.replacedByTokenId !== null) {
                // Possible refresh-token reuse
                // Later: revoke entire session/token family

                return res.status(401).json({
                    message: "Refresh token reuse detected. Please login again."
                });

            }

            return res.status(403).json({
                message: "Session has been revoked."
            });
        }
        
        const currentTime = new Date();
        if(currentTime >= oldRefreshSession.expiresAt) {
            return res.status(403).json({message: "Current session is expired. Please! log in again."})
        }
        
        if (currentTime >= oldRefreshSession.absoluteExpiresAt) {
            return res.status(403).json({
                message: "Session lifetime expired. Please log in again."
            });
        }
        
        
        const now = new Date();
        const slidingExpiration = new Date(now);
        slidingExpiration.setDate(
            slidingExpiration.getDate() + 30
        );

        const newExpiresAt = (slidingExpiration < oldRefreshSession.absoluteExpiresAt ? slidingExpiration : oldRefreshSession.absoluteExpiresAt);
        



        const user = await UserModel.findOne({_id: oldRefreshSession.userId});

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists."
            });
        }

        const accessTokenPayload = {
            id: user._id.toString(),
            email: user.email,
            sessionId: oldRefreshSession.sessionId,
            role: user.role, 
        }
        const newAccessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, {expiresIn: "15m"});

        const newRefreshToken = crypto.randomBytes(64).toString("base64url");

        // create new refresh token.
        const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

        const newRefreshSessionPayload = {
            userId: oldRefreshSession.userId,

            sessionId: oldRefreshSession.sessionId,

            tokenHash: newRefreshTokenHash,

            device: oldRefreshSession.device,

            userAgent: oldRefreshSession.userAgent,

            createdAt: new Date(),

            lastUsedAt: new Date(),

            expiresAt: newExpiresAt,

            absoluteExpiresAt: oldRefreshSession.absoluteExpiresAt,

            revokedAt: null,

            parentTokenId: oldRefreshSession._id,

            replacedByTokenId: null
        } 

        // console.log(newRefreshSessionPayload);

        
        const newRefreshSession = await RefreshSessionModel.create(newRefreshSessionPayload); 

        // console.log("previous token-------------")
        // console.log(oldRefreshSession);
        
        await RefreshSessionModel.findByIdAndUpdate(
            oldRefreshSession._id,
            {
                $set: {
                    revokedAt: now,
                    replacedByTokenId: newRefreshSession._id
                }
            }
        );


        // console.log("-----------------------------------")
        // console.log("previous token-------------")
        // console.log(newRefreshSession);

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: false,
            maxAge: 15*60*1000

        })

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: false,
            maxAge: newExpiresAt.getTime() - now.getTime()

        })

        res.status(200).json({message: "Token refreshed successfully."});

    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}


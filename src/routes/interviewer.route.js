import { Router } from "express";
import { createInterview } from "../controllers/interviewer.controller.js";

const InterviewerRouter = Router();

InterviewerRouter.put("/create-interview", createInterview);

export default InterviewerRouter;
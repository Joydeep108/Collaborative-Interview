import {Router} from "express";
import { acceptInvitaions, getAllInterviewInvitaions } from "../controllers/candidate.controller.js";

const CandidateRouter = Router();

CandidateRouter.get("/invitaions", getAllInterviewInvitaions);
CandidateRouter.post("/invitaions/:id/accept", acceptInvitaions);
CandidateRouter.post("/invitaions/:id/reject", acceptInvitaions);

export default CandidateRouter;
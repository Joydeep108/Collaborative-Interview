import express from "express";
import cors from "cors"
import useragent from "express-useragent"
import AuthRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import authMiddleware from "./middlewares/auth.middleware.js";
import InterviewerRouter from "./routes/interviewer.route.js";
import interviewerMiddleware from "./middlewares/interviewer.middleware.js";
import candidateMiddleware from "./middlewares/candidate.middleware.js";
import CandidateRouter from "./routes/candidate.route.js";

const app = express();


app.use(cors());
app.use(useragent.express());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use("/auth", AuthRouter);
// app.post("/", authMiddleware);
app.use("/interviewer", authMiddleware, interviewerMiddleware, InterviewerRouter);
app.use("/candidate", authMiddleware, candidateMiddleware, CandidateRouter);

export default app;
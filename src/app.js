import express from "express";
import cors from "cors"
import useragent from "express-useragent"
import AuthRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import authMiddleware from "./middlewares/auth.middleware.js";

const app = express();


app.use(cors());
app.use(useragent.express());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use("/auth", AuthRouter);
app.post("/", authMiddleware)

export default app;
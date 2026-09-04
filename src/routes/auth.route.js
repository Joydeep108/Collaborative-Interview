import { Router } from "express";
import { login, logout, refresh, signup } from "../controllers/auth.controllers.js";

const AuthRouter = Router();

AuthRouter.post("/signup", signup);
AuthRouter.post("/login", login);
AuthRouter.post("/logout", logout);
AuthRouter.post("/refresh", refresh);
// AuthRouter.post("/logout-all", logoutAll);

export default AuthRouter;
import express from "express";
import { auth } from "../middleware/authenticate.middleware.js";
import { login,logout,getMe } from "../controllers/auth.controller.js";

const userRouter=express.Router();

userRouter.post("/login",login);
userRouter.post("/logout",auth,logout);
userRouter.get("/me",auth,getMe);

export default userRouter;


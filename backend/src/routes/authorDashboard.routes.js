import express from "express";
import { auth } from "../middleware/authenticate.middleware.js";
import authorizeRole from "../middleware/authorizeRole.js";
import {getAuthorDashboardStats} from "../controllers/authorDashboard.controller.js";

const authorDashboardRouter = express.Router();

authorDashboardRouter.get("/dashboard",auth,authorizeRole("AUTHOR"),getAuthorDashboardStats);

export default authorDashboardRouter;

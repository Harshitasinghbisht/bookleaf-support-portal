import express from "express";
import { auth } from "../middleware/authenticate.middleware.js";
import authorizeRole from "../middleware/authorizeRole.js";
import { getAdminDashboardStats } from "../controllers/adminDashboard.controller.js";

const adminDashboardRouter = express.Router();

adminDashboardRouter.get("/dashboard",auth,authorizeRole("ADMIN"),getAdminDashboardStats);

export default adminDashboardRouter;

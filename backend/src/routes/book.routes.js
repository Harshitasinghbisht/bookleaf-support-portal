import express from "express";
import { auth } from "../middleware/authenticate.middleware.js";
import authorizeRole from "../middleware/authorizeRole.js";
import { getMyBooks , getMyBookById ,getMyRoyaltySummary } from "../controllers/books.controller.js";

const bookRouter=express.Router();
bookRouter.get("/royaltySummary",auth,authorizeRole("AUTHOR"),getMyRoyaltySummary);
bookRouter.get("/",auth,authorizeRole("AUTHOR"),getMyBooks);
bookRouter.get("/:bookId",auth,authorizeRole("AUTHOR"),getMyBookById);


export default bookRouter;
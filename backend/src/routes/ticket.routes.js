import express from "express";
import { auth } from "../middleware/authenticate.middleware.js";
import authorizeRole from "../middleware/authorizeRole.js";
import { createTicket, getMyTicketById, getMyTickets , getTicketConversation,addTicketMessage } from "../controllers/ticket.controller.js";

const ticketRouter=express.Router();

ticketRouter.post("/",auth,authorizeRole("AUTHOR"),createTicket);
ticketRouter.get("/",auth,authorizeRole("AUTHOR"),getMyTickets);
ticketRouter.get("/:ticketId",auth,authorizeRole("AUTHOR"),getMyTicketById);
ticketRouter.get("/:ticketId/conversation",auth,authorizeRole("AUTHOR"),getTicketConversation);
ticketRouter.post("/:ticketId/message",auth,authorizeRole("AUTHOR"),addTicketMessage);
export default ticketRouter;
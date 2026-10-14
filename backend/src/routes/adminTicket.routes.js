import expree from "express";
import { auth } from "../middleware/authenticate.middleware.js";
import authorizeRole from "../middleware/authorizeRole.js";
import { getAdminTicketById,getAllTickets,addAdminTicketMessage,assignTicket,updateTicket } from "../controllers/admin_ticket.controller.js";

const adminTicketRouter=expree.Router();

adminTicketRouter.get("/tickets",auth,authorizeRole("ADMIN"),getAllTickets)
adminTicketRouter.get("/tickets/:ticketId",auth,authorizeRole("ADMIN"),getAdminTicketById);
adminTicketRouter.patch("/tickets/:ticketId",auth,authorizeRole("ADMIN"),updateTicket);
adminTicketRouter.patch("/tickets/:ticketId/assign",auth,authorizeRole("ADMIN"),assignTicket);
adminTicketRouter.post("/tickets/:ticketId/messages",auth,authorizeRole("ADMIN"),addAdminTicketMessage);

export default adminTicketRouter;
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { prisma } from "./config/prisma.js";
import { createServer } from "node:http";
import { initializeSocket } from "../src/socket.js";

//router are here
import userRouter from "./routes/auth.routes.js";
import bookRouter from "./routes/book.routes.js";
import ticketRouter from "./routes/ticket.routes.js";
import adminTicketRouter from "./routes/adminTicket.routes.js";
import adminDashboardRouter from "./routes/adminDashboard.routes.js";
import authorDashboardRouter from "./routes/authorDashboard.routes.js";


dotenv.config();
const app=express();

const port=process.env.PORT || 4000;
app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PUT', 'PATCH'],
    allowedHeaders:['Content-Type','Authorization']
}))

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use("/api/v1/auth",userRouter);
app.use("/api/v1/books",bookRouter);
app.use("/api/v1/tickets",ticketRouter);
app.use("/api/v1/admin",adminTicketRouter);
app.use("/api/v1/admin",adminDashboardRouter);
app.use("/api/v1/author",authorDashboardRouter);



app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Route not found.",
    });
});


const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to NEON Postgres");

    const httpServer = createServer(app);

    initializeSocket(httpServer);

    httpServer.listen(port, () => {
      console.log(`App listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();


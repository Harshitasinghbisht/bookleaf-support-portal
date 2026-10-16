
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "./config/prisma.js";

let io;

export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    },
  });

  // Authenticate each socket connection.
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || "";

      const tokenCookie = cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("token="));

      const token = tokenCookie
        ? decodeURIComponent(tokenCookie.slice("token=".length))
        : null;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      // Attach the verified database user to the socket.
      socket.data.user = user;

      next();
    } catch (error) {
      console.error("Socket authentication failed:", error.message);
      next(new Error("Invalid or expired token"));
    }
  });


io.on("connection", (socket) => {
  const user = socket.data.user;

  console.log(`Authenticated socket connected: ${user.id}`);

  // Admins can receive admin-only real-time events.
  
if (user.role === "ADMIN") {
  socket.join("admins");
} else {
  socket.join(`author:${user.id}`);
}


  socket.on("ticket:join", async ({ ticketId } = {}) => {
    try {
      if (typeof ticketId !== "string" || !ticketId.trim()) {
        socket.emit("ticket:error", {
          message: "A valid ticket ID is required.",
        });
        return;
      }

      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: {
          id: true,
          author: {
            select: { userId: true },
          },
        },
      });

      if (!ticket) {
        socket.emit("ticket:error", {
          message: "Ticket not found.",
        });
        return;
      }

      const isAdmin = user.role === "ADMIN";
      const isOwner = ticket.author.userId === user.id;

      if (!isAdmin && !isOwner) {
        socket.emit("ticket:error", {
          message: "You are not allowed to access this ticket.",
        });
        return;
      }

      socket.join(`ticket:${ticketId}`);

      // Internal notes must never be delivered to authors.
      if (isAdmin) {
        socket.join(`ticket-admin:${ticketId}`);
      }

      socket.emit("ticket:joined", { ticketId });
    } catch (error) {
      console.error("Ticket room join failed:", error);
      socket.emit("ticket:error", {
        message: "Could not join the ticket room.",
      });
    }
  });

  socket.on("ticket:leave", ({ ticketId } = {}) => {
    if (typeof ticketId !== "string") return;

    socket.leave(`ticket:${ticketId}`);
    socket.leave(`ticket-admin:${ticketId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});


  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
}

import { prisma } from "../config/prisma.js";
import { draftTicketResponse } from "../services/aiService.js";
import { getIO } from "../socket.js";

  const parsePagination = (query) => {
  const { page = "1", limit = "10" } = query;

  // Accept only positive integer strings
  if (
    !/^[1-9]\d*$/.test(page) ||
    !/^[1-9]\d*$/.test(limit)
  ) {
    return {
      error: "page and limit must be positive integers",
    };
  }

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  if (
    !Number.isSafeInteger(parsedPage) ||
    !Number.isSafeInteger(parsedLimit)
  ) {
    return {
      error: "page and limit are too large",
    };
  }

  if (parsedLimit > 50) {
    return {
      error: "limit cannot exceed 50",
    };
  }

  return {
    page: parsedPage,
    limit: parsedLimit,
  };
};
const sendError = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });
  const TicketStatus=[
    "OPEN", 
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED"
];

const TicketPriority=[
    "CRITICAL",
     "HIGH",
    "MEDIUM",
     "LOW"
];

const TicketCategory=[
    "ROYALTY_PAYMENTS", 
    "ISBN_METADATA", 
    "PRINTING_QUALITY", 
    "DISTRIBUTION_AVAILABILITY", 
    "BOOK_STATUS_PRODUCTION", 
    "GENERAL_INQUIRY"
]
const MessageType=[
    "RESPONSE",
    "INTERNAL_NOTE"
]

export const getAllTickets=async(req,res)=>{
const {page, limit, status, priority, category }= req.query;

    try {
    if (category !== undefined && !TicketCategory.includes(category)) {
  return sendError(res, 400, "Invalid ticket category");
}

if (priority !== undefined && !TicketPriority.includes(priority)) {
  return sendError(res, 400, "Invalid ticket priority");
}

if (status !== undefined && !TicketStatus.includes(status)) {
  return sendError(res, 400, "Invalid ticket status");
}
const pagination = parsePagination(req.query);
if (pagination.error) {
  return res.status(400).json({
    success: false,
    message: pagination.error,
  });
}

const { page, limit } = pagination;
const skip = (page - 1) * limit;


const where = {};
 if (status) {
  where.status = status;
}
if (category) {
  where.category = category;
}

if (priority) {
  where.priority = priority;
}


const [tickets, totalTickets] = await Promise.all([
  prisma.ticket.findMany({
    where,
    orderBy: [
  { createdAt: "desc" },
  { id: "desc" },
],
    skip,
    take: limit,
    select: {
      id: true,
      ticketNumber: true,
      subject: true,
      status: true,
      category: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
      assignedToId: true,
      author: {
        select: {
          authorCode: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  }),

  prisma.ticket.count({
    where,
  }),
]);

   res.status(200).json({
    success:true,
    message:"Ticket retrived sccessfully",
    pagination,
    data:tickets,
    totalTickets
   })
    } catch (error) {
     console.error("get all ticcket error",error);
     return sendError(res,500,"Internal server error");   
    }
    
}
export const getAdminTicketById=async(req,res)=>{
const {ticketId}=req.params;
if(!ticketId){
    return sendError(res,404,"Ticket id is required");
}
try {
   const ticket = await prisma.ticket.findUnique({
  where: { id: ticketId },
  select: {
    id: true,
    ticketNumber: true,
    subject: true,
    description: true,
    status: true,
    category: true,
    priority: true,
    createdAt: true,
    updatedAt: true,
    author: {
      select: {
        authorCode: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    },
     aiDrafts: {
       orderBy: {
         createdAt: "desc",
       },
       take: 1,
       select: {
         id: true,
         ticketId: true,
         content: true,
         model: true,
         createdAt: true,
       },
     },

    messages: {
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        body: true,
        type: true,
        createdAt: true,
        sender: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    },
  },
});
if(!ticket){
    return sendError(res,404,"Ticket not found")
}
res.status(200).json({
    success:true,
    message:"Ticket featched successfully",
    data:ticket
})
} catch (error) {
    console.error("get ticket by id error",error);
    return sendError(res,500,"Internal server error");

}
}

export const updateTicket=async(req,res)=>{
   const {ticketId}=req.params;
   const  {status,category,priority}=req.body;

if (
  status === undefined &&
  category === undefined &&
  priority === undefined
) {
  return sendError(res, 400, "At least one field is required to update or invalid field");
}
   if(!ticketId){
    return sendError(res,404,"TicketId is required");
   } 
  if (
  status !== undefined &&
  !TicketStatus.includes(status)
) {
  return sendError(res, 400, "Invalid status");
}

if (
  category !== undefined &&
  !TicketCategory.includes(category)
) {
  return sendError(res, 400, "Invalid category");
}

if (
  priority !== undefined &&
  !TicketPriority.includes(priority)
) {
  return sendError(res, 400, "Invalid priority");
}
   try {
    const existingTicket=await prisma.ticket.findUnique({
        where:{id:ticketId},
        select:{ id: true,
        status: true,
        category: true,
        priority: true,}
    })
    if(!existingTicket){
        return sendError(res,404,"Ticket not found");
    }

const data = {};

 if (status !== undefined) {
      data.status = status;

      if (status === "RESOLVED" && existingTicket.status !== "RESOLVED") {
        data.resolvedAt = new Date();
      } else if (
        existingTicket.status === "RESOLVED" &&
        status !== "RESOLVED"
      ) {
        // Clear the old resolution timestamp when reopened
        data.resolvedAt = null;
      }
    }

    if (category !== undefined) {
      data.category = category;

      if (category !== existingTicket.category) {
        data.categoryOverridden = true;
      }
    }

    if (priority !== undefined) {
      data.priority = priority;

      if (priority !== existingTicket.priority) {
        data.priorityOverridden = true;
      }
    }
    if (existingTicket.status === "CLOSED" && status !== "CLOSED") {
  return sendError(
    res,
    409,
    "Closed tickets cannot be modified."
  );
}
  const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data,
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        category: true,
        priority: true,
        aiCategory: true,
        aiPriority: true,
        categoryOverridden: true,
        priorityOverridden: true,
        resolvedAt: true,
        firstResponseAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: updatedTicket,
    });
   } catch (error) {
     console.error("Update ticket error:", error);
    return sendError(res, 500, "Internal server error");
   }
}

export const assignTicket=async(req,res)=>{
const {ticketId}=req.params;
const assignedToId=req.user.id;
if(!ticketId){
    return sendError(res,404,"Ticket Id is required");
}
try {
    const ticket=await prisma.ticket.findUnique({
        where:{id:ticketId},
        select:{id:true}
    })
    if(!ticket){
        return sendError(res,404,"Ticket not found")
    }
    const admin=await prisma.user.findFirst({
        where:{
            id:assignedToId,
            role:"ADMIN",
            isActive:true
        },
        select:{
            id:true,
            name:true,
            email:true,
        }
    })
    if(!admin){
        return sendError(res,409,"Invalid or inactive admin assign");
    }
 const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedToId: assignedToId,
      },
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        status: true,
        priority: true,
        assignedToId: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      data: updatedTicket,
    });
} catch (error) {
    console.error("Assign ticket error:", error);
    return sendError(res, 500, "Internal server error");
}

}
export const addAdminTicketMessage=async(req,res)=>{
const {ticketId}=req.params;
const {body,type}=req.body;
const maxLength=5000;

 if (!ticketId || typeof ticketId !== "string") {
      return sendError(res, 400, "Ticket ID is required");
    }

    // 2. Validate message
    if (typeof body !== "string" || !body.trim()) {
      return sendError(res, 400, "Message cannot be empty");
    }

    const trimmedBody = body.trim();

    if (trimmedBody.length > maxLength) {
      return sendError(res, 400, "Message cannot exceed 5000 characters");
    }
    if(!MessageType.includes(type)){
        return sendError(res,400,"Invalid Message Type")
    }
    try {
       const ticket = await prisma.ticket.findUnique({
  where: { id: ticketId },
  select: {
    id: true,
    status: true,
    firstResponseAt: true
  }
});
        if(!ticket){
            return sendError(res,404,"Ticket is not found");
        }
       if (
  ticket.status === "RESOLVED" ||
  ticket.status === "CLOSED"
) {
  return sendError(
    res,
    409,
    "Ticket is already resolved or closed"
  );
}
       
       const now = new Date();

const transactionOperations = [
  prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      senderId: req.user.id, // Use the property your middleware sets
      body: trimmedBody,
      type,
    },
    select: {
      id: true,
      body: true,
      type: true,
      createdAt: true,
      sender: {
        select: { name: true },
      },
    },
  }),

  prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      updatedAt: now,
      ...(type === "RESPONSE" && !ticket.firstResponseAt
        ? { firstResponseAt: now }
        : {}),
    },
  }),
];

const [message] = await prisma.$transaction(transactionOperations);

const io = getIO();

const eventPayload = {
  ticketId: ticket.id,
  message,
};

if (type === "RESPONSE") {
  io.to(`ticket:${ticket.id}`).emit(
    "message:created",
    eventPayload
  );
} else if (type === "INTERNAL_NOTE") {
  io.to(`ticket-admin:${ticket.id}`).emit(
    "message:created",
    eventPayload
  );
}


return res.status(201).json({
  success: true,
  message: "Message created successfully",
  data: message,
});
    } catch (error) {
        console.error("add admin ticket message error",error)
        return sendError(res,500,"Internal server error");
    }
}

export const generateAdminTicketDraft=async(req,res)=>{
  const {ticketId}=req.params;
  if(!ticketId){
    return sendError(res,404,"Ticket id is required");
  }
  const startTime = Date.now();
  try {
    const ticket = await prisma.ticket.findUnique({
  where: { id: ticketId },
  include: {
    book: {
      select: {
        title: true,
      },
    },
  },
});
    if(!ticket){
      return sendError(res,404,"Ticket not found")
    }
    if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
      return sendError(
        res,
        409,
        "Cannot generate a draft for a resolved or closed ticket"
      );
    }

    const result=await draftTicketResponse({
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
       bookTitle: ticket.book?.title ?? null,

    })
    const draft=await prisma.aiDraft.create({
      data:{
         ticketId: ticket.id,
        content: result.content,
        model: result.model,
      },
       select: {
        id: true,
        ticketId: true,
        content: true,
        model: true,
        createdAt: true,
      },
    })
    
     await prisma.aiCall.create({
      data: {
        ticketId: ticket.id,
        kind: "DRAFT_RESPONSE",
        model: result.model,
        latencyMs: Date.now() - startTime,
        success: true,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Response draft generated successfully",
      data: draft,
    });

  } catch (error) {
    console.error("Generate admin ticket draft error:", error);

    try {
     await prisma.aiCall.create({
  data: {
    ticketId,
    kind: "DRAFT_RESPONSE",
    mode: "real-ai",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    latencyMs: Date.now() - startTime,
    success: false,
    errorMessage: String(
      error?.message || "Draft generation failed"
    ).slice(0, 500),
  },
});
    } catch (loggingError) {
      console.error("Failed to log AI draft error:", loggingError);
    }

    return sendError(res, 503, "Unable to generate a response draft");
  }
}
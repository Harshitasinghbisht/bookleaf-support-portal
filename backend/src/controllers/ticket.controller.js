import { prisma } from "../config/prisma.js";
import { classifyTicket } from "../services/aiService.js";
import { getIO } from "../socket.js";

const sendError = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

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
//important controller to study
export const createTicket = async (req, res) => {
  const { subject, description, bookId } = req.body;
  const userId = req.user.id;

  if (
    typeof subject !== "string" ||
    !subject.trim() ||
    typeof description !== "string" ||
    !description.trim()
  ) {
    return sendError(
      res,
      400,
      "Subject and description are required"
    );
  }

  if (
    bookId !== undefined &&
    (typeof bookId !== "string" || !bookId.trim())
  ) {
    return sendError(res, 400, "Invalid bookId");
  }

  try {
    const author = await prisma.author.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!author) {
      return sendError(res, 404, "Author profile not found");
    }

    if (bookId) {
      const book = await prisma.book.findFirst({
        where: {
          id: bookId,
          authorId: author.id,
        },
        select: { id: true },
      });

      if (!book) {
        return sendError(res, 400, "Invalid Book selection");
      }
    }

    // 1. Create the ticket first with safe defaults.
    let ticket = await prisma.ticket.create({
      data: {
        subject: subject.trim(),
        description: description.trim(),
        category: "GENERAL_INQUIRY",
        priority: "MEDIUM",
        authorId: author.id,
        bookId: bookId || null,
        aiStatus: "PENDING",
      },
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        description: true,
        category: true,
        priority: true,
        status: true,
        aiCategory: true,
        aiPriority: true,
        aiPriorityReason: true,
        aiStatus: true,
        createdAt: true,
      },
    });

    // 2. Try classification separately.
    const startedAt = Date.now();
    let aiResult;

    try {
      aiResult = await classifyTicket({
        subject: ticket.subject,
        description: ticket.description,
      });
    } catch (aiError) {
      console.error("Ticket classification failed:", aiError.message);

      // The ticket already exists, so preserve it.
      try {
        ticket = await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            aiStatus: "FAILED",
            aiProcessedAt: new Date(),
          },
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
            description: true,
            category: true,
            priority: true,
            status: true,
            aiCategory: true,
            aiPriority: true,
            aiPriorityReason: true,
            aiStatus: true,
            createdAt: true,
          },
        });

        await prisma.aiCall.create({
          data: {
            ticketId: ticket.id,
            kind: "CLASSIFY_PRIORITY",
            model: "mock-development",
            latencyMs: Date.now() - startedAt,
            success: false,
            errorMessage: aiError.message.slice(0, 500),
          },
        });
      } catch (loggingError) {
        console.error(
          "Could not save AI failure details:",
          loggingError.message
        );
      }
    }

    // 3. Save the suggestions if classification succeeded.
    if (aiResult) {
      try {
        ticket = await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            category: aiResult.category,
            priority: aiResult.priority,
            aiCategory: aiResult.category,
            aiPriority: aiResult.priority,
            aiPriorityReason: aiResult.reason,
            aiStatus: "COMPLETED",
            aiProcessedAt: new Date(),
          },
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
            description: true,
            category: true,
            priority: true,
            status: true,
            aiCategory: true,
            aiPriority: true,
            aiPriorityReason: true,
            aiStatus: true,
            createdAt: true,
          },
        });

        try {
          await prisma.aiCall.create({
            data: {
              ticketId: ticket.id,
              kind: "CLASSIFY_PRIORITY",
              model: aiResult.model,
              latencyMs: Date.now() - startedAt,
              success: true,
            },
          });
        } catch (loggingError) {
          console.error(
            "Could not save AI call log:",
            loggingError.message
          );
        }
      } catch (updateError) {
        console.error(
          "Could not save AI classification:",
          updateError.message
        );
        // The ticket was already created.
        // Do not turn this into a failed ticket-creation response.
      }
    }
   // Notify connected clients about the new ticket.
try {
  const io = getIO();

  // Refresh the admin ticket queue.
  io.to("admins").emit("admin:tickets:updated", {
    ticketId: ticket.id,
  });

  // Refresh this author's ticket list.
  io.to(`author:${userId}`).emit("author:tickets:updated", {
    ticketId: ticket.id,
  });
} catch (socketError) {
  console.error("Ticket notification failed:", socketError.message);
}
    return res.status(201).json({
      success: true,
      message: "Ticket generated successfully",
      ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    return sendError(res, 500, "Internal server error");
  }};


export const getMyTickets=async(req,res)=>{
const userId=req.user.id;
try {
    const author=await prisma.author.findUnique({
        where:{userId},
        select:{
            id:true
        }
    })
    if(!author){
        return sendError(res,404,"Author profile not found")
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

const tickets = await prisma.ticket.findMany({
  where: {
    authorId: author.id,
  },
  orderBy: [
    { updatedAt: "desc" },
    { id: "desc" },
  ],
  skip,
  take: limit,
});
const totalTickets = await prisma.ticket.count({
  where: {
    authorId: author.id,
  },
});
const [openCount, inProgressCount, resolvedCount] = await Promise.all([
  prisma.ticket.count({
    where: { authorId: author.id, status: "OPEN" },
  }),
  prisma.ticket.count({
    where: { authorId: author.id, status: "IN_PROGRESS" },
  }),
  prisma.ticket.count({
    where: { authorId: author.id, status: "RESOLVED" },
  }),
]);
return res.status(200).json({
  success: true,
  data: tickets,
  pagination: {
    page,
    limit,
    totalTickets,
    totalPages: Math.ceil(totalTickets / limit),
    hasNextPage: skip + tickets.length < totalTickets,
    hasPreviousPage: page > 1,
  },
   stats: {
    total: totalTickets,
    open: openCount,
    inProgress: inProgressCount,
    resolved: resolvedCount,
  },
});
} catch (error) {
    console.error("getMyticket error",error)
    return sendError(res,500,"internal server error");
}
}

export const getMyTicketById=async(req,res)=>{
  const {ticketId}= req.params;
  const userId=req.user.id;
  try {
    const author=await prisma.author.findUnique({
        where:{userId},
        select:{
            id:true
        }
    })
    if(!author){
        return sendError(res,404,"Author not found")
    }
   const ticket = await prisma.ticket.findFirst({
  where: {
    id: ticketId,
    authorId: author.id,
  },
  select: {
    id: true,
    ticketNumber: true,
    subject: true,
    description: true,
    category: true,
    priority: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    firstResponseAt: true,
    resolvedAt: true,

    book: {
      select: {
        id: true,
        title: true,
        isbn: true,
      },
    },

    attachments: {
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
    },

    messages: {
      where: {
        type: "RESPONSE",
      },
      orderBy: {
        createdAt: "asc",
      },
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

if (!ticket) {
  return res.status(404).json({
    success: false,
    message: "Ticket not found",
  });
}

return res.status(200).json({
    success:true,
    message:"Ticket found successfully",
    ticket
})
  } catch (error) {
    console.error("getTicketById error",error);
    return sendError(res,500,"Internal server error");
  }  
}
export const getTicketConversation=async(req,res)=>{
    const {ticketId}=req.params;
    const userId=req.user.id;
    
    if (!ticketId) {
      return sendError(res, 400, "Ticket ID is required");
    }
    try {
        const author=await prisma.author.findUnique({
            where:{userId},
            select:{id:true}
        })
        if(!author){
            return sendError(res,404,"Author profile not found")
        }
        const ticket=await prisma.ticket.findFirst({
            where:{
                id:ticketId,
                authorId:author.id
            },
            select:{i:true}
        })
        if(!ticket){
            return sendError(res,404,"Ticket not found")
        }
          const messages = await prisma.ticketMessage.findMany({
      where: {
        ticketId: ticket.id,
        type: "RESPONSE",
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        body: true,
        type: true,
        createdAt: true,
        sender: {
          select: {
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
        success:true,
        messages:"Message feached successfully",
        data:messages
    })
    } catch (error) {
        console.error("get Ticket converstation error",error);
        sendError(res,500,"Internal server error");
    }
}

export const addTicketMessage=async(req,res)=>{
    const {ticketId}=req.params;
    const userId=req.user.id;
    const {body}=req.body?? {};
    const maxLength=5000;

    try {
        
      // 1. Validate ticket ID
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
       const author=await prisma.author.findUnique({
        where:{userId},
        select:{id:true}
       }) 
       if(!author){
        return sendError(res,404,"Author profile not found")
       }
       const ticket=await prisma.ticket.findFirst({
        where:{
            id:ticketId,
            authorId:author.id
        },
        select:{id:true,status:true}
       })
       if(!ticket){
        return sendError(res,404,"Ticket not found")
       }
       if(ticket.status==="CLOSED"){
        return sendError(res,409,"Ticket si already colsed");
       }
     
const [message] = await prisma.$transaction([
  prisma.ticketMessage.create({
    data: {
      ticketId: ticket.id,
      senderId: userId,
      body: trimmedBody,
      type: "RESPONSE",
    },
    select: {
      id: true,
      body: true,
      type: true,
      createdAt: true,
      sender: {
        select: {
          name: true,
        },
      },
    },
  }),

prisma.ticket.update({
  where: {
    id: ticket.id,
  },
  data: {
    updatedAt: new Date(),                       
  },
})
]);
     return res.status(201).json({
        success:true,
        message:"message created successfully",
        data:message
     })

    } catch (error) {
        console.error("ad ticket message error",error);
        return sendError(res,500,"Internal server error");
    }
}
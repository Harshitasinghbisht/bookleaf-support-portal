import { prisma } from "../config/prisma.js";

const sendError = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

export const getMyBooks=async(req,res)=>{
  const controllerStartedAt = performance.now();
const userId=req.user.id;
try {
  
    const author =await prisma.author.findUnique({
        where:{userId},
          select: {
        id: true,
      },
    })

    if(!author ){
        return sendError(res,404,"Author profile not found")
    }
    console.time("books-db-query")
   const books=await prisma.book.findMany({
    where:{
        authorId:author.id,
    },
    select:{
        id: true,
        title: true,
        isbn: true,
        genre: true,
        publicationDate: true,
        status: true,
        mrp: true,
        totalCopiesSold: true,
        totalRoyaltyEarned: true,
        royaltyPaid: true,
        royaltyPending: true,
    }
   })
   console.timeEnd("books-db-query");
   return res.status(200).json({
    success:true,
    message:"Books retrieved  successfully",
    books
   })
    
} catch (error) {
     console.error("get all getmybook",error)
     sendError(res,500,"internal server error")
}
finally {
  console.log(
    `books-controller-total: ${(performance.now() - controllerStartedAt).toFixed(1)}ms`
  );
}
}

export const getMyBookById=async(req,res)=>{
const {bookId}=req.params;
const userId=req.user.id;

if(!bookId){
    return sendError(res,400,"bookId is required");
}
try {
     const author = await prisma.author.findUnique({
      where: { userId },
      select: { id: true },
    });
     if (!author) {
      return sendError(res, 404, "Author profile not found");
    }
    const book=await prisma.book.findUnique({
        where:{authorId:author.id,
            id:bookId
        },
         select: {
        id: true,
        title: true,
        isbn: true,
        genre: true,
        publicationDate: true,
        status: true,
        mrp: true,
        totalCopiesSold: true,
        totalRoyaltyEarned: true,
        royaltyPaid: true,
        royaltyPending: true,
      },
    })
    if(!book){
        return sendError(res,404,"book not found");
    }

    return res.status(200).json({
        success:true,
        message:"book found successfully",
        book
    })
} catch (error) {
    console.error("get all getmybookbyid",error)
     sendError(res,500,"internal server error")
}
}


export const getMyRoyaltySummary=async(req,res)=>{
    try {
    // 1. Get the authenticated user's ID
    const userId = req.user.id;

    // 2. Find the author's profile
    const author = await prisma.author.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author profile not found",
      });
    }

    // 3. Aggregate royalty figures for this author's books
    const royaltySummary = await prisma.book.aggregate({
      where: {
        authorId: author.id,
      },
      _sum: {
        totalCopiesSold: true,
        totalRoyaltyEarned: true,
        royaltyPaid: true,
        royaltyPending: true,
      },
      _count: {
        id: true,
      },
    });

    // 4. Return the summary
    return res.status(200).json({
      success: true,
      message: "Royalty summary retrieved successfully",
      data: {
        totalBooks: royaltySummary._count.id,
        totalCopiesSold: royaltySummary._sum.totalCopiesSold ?? 0,
        totalRoyaltyEarned:royaltySummary._sum.totalRoyaltyEarned ?? 0,
        royaltyPaid: royaltySummary._sum.royaltyPaid ?? 0,
        royaltyPending: royaltySummary._sum.royaltyPending ?? 0,
      },
    });
  } catch (error) {
     console.error("get all getMyRoyaltySummary",error)
     sendError(res,500,"internal server error")
  }
}
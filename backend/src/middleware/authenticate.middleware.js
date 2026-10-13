import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

export  const auth=async(req,res,next)=>{
    try {
      const token=req.cookies.token;
      
      if(!token){
          return res.status(401).json({
              success:false,
              message:"authentication failed"
          })
      }
       const decoded=jwt.verify(token,process.env.JWT_SECRET);
      const user=await prisma.user.findUnique({
        where:{id:decoded.id},
        select: {
            id: true,
            name: true,
            email: true,
            role:true
    }
      })
   if(!user){
          return res.status(401).json({
              success:false,
              message:"user not found"
          })
      }
      req.user=user;
      
      next();
    } catch (error) {
         console.error("authmiddleware error",error)
          return res.status(401).json({
              success:false,
              message:"Invalid or expired token"
          })
    }
}
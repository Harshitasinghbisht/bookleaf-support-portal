import { prisma } from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sendError = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

export const login=async(req,res)=>{
    const email=req.body.email?.trim();
   const password = req.body.password;
if(!email  || !password){
    return sendError(res, 400, "All field are required");
}
try {
    const user=await prisma.user.findUnique({
        where:{
            email
        }
    })
    if(!user){
        return sendError(res,401,"Invalid email or password");
    }
    const isMatched=await bcrypt.compare(password,user.passwordHash);
    if(!isMatched){
        return sendError(res,401,"Incorrect password")
    }
    
    const token=jwt.sign({id:user.id},
        process.env.JWT_SECRET,
        {expiresIn:"24h"}
    )
    
    const cookiesOption={
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000
      }
    
      res.cookie("token",token,cookiesOption);
    
      return res.status(200).json({
        success:true,
        message:"User login successfully",
        user:{
            id:user.id,
            name:user.name,
            role:user.role,
            email:user.email
        }
      })
} catch (error) {
    console.error("userLoginerror",error);
    return sendError(res,500,"internal server error")
}
}

export const logout=async(req,res)=>{
    try {
          res.clearCookie("token",{
          httpOnly: true,
          secure: true,
          sameSite: "none",
    })
        return res.status(200).json({
      message: "Logout successful",
      success: true
    });
    } catch (error) {
         console.error("logoutError",error)
         return sendError(res,500,"Internal server error");
    }
}

export const getMe=async(req,res)=>{
    const userId=req.user.id;

    try {
    const user=await prisma.user.findUnique({
        where:{id:userId},
         select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })    
    if(!user){
        return sendError(res,404,"User not found")
    }
     return res.status(200).json({
      success:true,
      message:"User found",
      user
    })
    } catch (error) {
         console.error("getMeError",error)
         return sendError(res,500,"Internal server error");
    }
}

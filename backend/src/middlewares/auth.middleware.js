import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import  User  from "../models/user.model.js";


export const verifyUser = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.JwtToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json(new ApiResponse(401, "Unauthorized request"));
    }

    // Only validate token format if token exists
    if (token && (typeof token !== 'string' || token.length < 10 || !token.includes('.'))) {
      return res.status(401).json(new ApiResponse(401, "Invalid token format"));
    }

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    //console.log(decodedToken, "decodedToken")

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user) {
      return res.status(401).json(new ApiResponse(401, "Unauthorized request"));
    }

    //console.log(user, "user")

    req.user = user;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json(new ApiResponse(401, "Invalid or expired token"));
  }
});

export const verifySeller = asyncHandler(async (req, res, next) => {
  try {
    const user = req.user;
    console.log(user, "user seller");
   // console.log(user);

    if (user.userType !== "seller") {
     return res.status(403).json(new ApiResponse(403, "Only suppliers can access this resource"));
    }

    next();
  } catch (error) {
    return res.status(401).json(new ApiResponse(401, error?.message || "Unauthorized request"));
  }
});

export const verifyBuyer = asyncHandler(async (req, res, next) => {
  try {
    const user = req.user;
    console.log(user, "user buyer");

    if (user.userType !== "user") {
     return res.status(403).json(new ApiResponse(403, "Only buyers can access this resource"));
    }

    next();
  } catch (error) {
    return res.status(401).json(new ApiResponse(401, error?.message || "Unauthorized request"));
  }
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  try {
    //i dont have to check if the user is a seller or buyer 



    const user = req.user;
    if(!user){
      return res.status(401).json(new ApiResponse(401, "Unauthorized request"));
    }
   // console.log(user);
    //console.log(user.userType);

    if (user.userType !== "admin") {
      return res.status(403).json(new ApiResponse(403, "Access denied"));
    }

    next();
  } catch (error) {
    return res.status(401).json(new ApiResponse(401, error?.message || "Unauthorized request"));
  }
});
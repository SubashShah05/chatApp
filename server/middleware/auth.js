// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    console.log("🔐 AUTH HEADER:", authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No token provided or invalid format");
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }
    
    const token = authHeader.split(" ")[1];
    console.log("✅ Token extracted:", token.substring(0, 20) + "...");
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);
    
    // Find user
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }
    
    console.log("✅ User authenticated:", user._id);
    
    // Attach user to request
    req.user = user;
    
    next();
    
  } catch (error) {
    console.error("❌ JWT ERROR:", error.message);
    
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { handleResponse } from "../utils/handleResponse.js";

dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return handleResponse(res, 401, "Access denied. No token provided.");
  }
  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return handleResponse(res, 401, "Invalid or expired token.");
  }
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return handleResponse(res, 403, "Access denied.");
    }
    next();
  };
};

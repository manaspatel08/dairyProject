import User from "../models/user.js";
import { handleResponse } from "../utils/handleResponse.js";
import { adminSchemaValidator } from "../validators/schemaValidation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerAdmin = async (req, res) => {
  try {
    const { error } = adminSchemaValidator.validate(req.body);
    if (error) {
      return handleResponse(res, 400, error.details[0].message);
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handleResponse(res, 409, "Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = await User.create({
      email,
      password: hashedPassword,
      role: "admin",
    });

    const token = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.EXPIRES_IN || "7d" }
    );

    return handleResponse(res, 201, "Admin registered successfully", {
      admin: { id: adminUser._id, email: adminUser.email, role: adminUser.role },
      token,
    });
  } catch (error) {
    return handleResponse(res, 400, "Bad Request", { error: error.message });
  }
};









import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Store from "../models/store.js";
import {superAdminSchemaValidator,customerSchemaValidator} from "../validators/schemaValidation.js";
import { handleResponse } from "../utils/handleResponse.js";
import { sendMail } from "../utils/mailer.js";



export const createSuperAdmin = async (req, res) => {
  try {
    const { error } = superAdminSchemaValidator.validate(req.body);
    if (error) {
      return handleResponse(res, 400, error.details[0].message);
    }

    const superAdminExists = await User.findOne({ role: "super_admin" });
    if (superAdminExists) {
      return handleResponse(
        res,
        409,
        "Only one Super Admin can be registered, there is already a super admin."
      );
    }

    const { email, password, mobileNo } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return handleResponse(res, 409, "Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSuperadmin = new User({
      email,
      password: hashedPassword,
      mobileNo,
      role: "super_admin",
    });
    await newSuperadmin.save();

    return handleResponse(
      res,
      201,
      "Superadmin created successfully",
      newSuperadmin
    );
  } catch (error) {
    return handleResponse(res, 400, "Bad Request", { error: error.message });
  }
};


export const registerCustomer = async (req, res) => {
  try {
    console.log("START");

console.time("validation");
    const { error } = customerSchemaValidator.validate(req.body);
    console.timeEnd("validation");
    if (error) {
      return handleResponse(res, 400, error.details[0].message);
    }

    const { email, password, mobileNo } = req.body;
console.time("findUser");
    const userExists = await User.findOne({ email });
    console.timeEnd("findUser");
    if (userExists) {
      return handleResponse(res, 409, "Email already exists.");
    }
console.time("hash");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.timeEnd("hash");
    console.time("create");
    const newCustomer = await User.create({
      email,
      password: hashedPassword,
      mobileNo,
      role: "customer",
    });
    console.timeEnd("create");

// await sendMail({
//   to: newCustomer.email,
//   subject: "Welcome to Dairy Product",
//   html: `
//     <h2>Welcome, ${newCustomer.name || newCustomer.email}!</h2>
//     <p>Thank you for registering at <b>DairyProduct</b>.</p>
//     <p>You can now order fresh dairy items and manage your subscriptions easily.</p>
//   `,
// });

    return handleResponse(
      res,
      201,
      "Customer created successfully",
      newCustomer
    );
  } catch (error) {
    return handleResponse(res, 400, "Bad Request", { error: error.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return handleResponse(res, 400, "Email and password are required");
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return handleResponse(res, 401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare( password, existingUser.password );
    if (!isPasswordValid) {
      return handleResponse(res, 401, "Invalid email or password");
    }

    const token = jwt.sign({ id: existingUser.id, role: existingUser.role },process.env.JWT_SECRET, { expiresIn: process.env.EXPIRES_IN || "7d" });
    return handleResponse(res, 200, "Login successful", {
      token,
      role: existingUser.role,
      email: existingUser.email,
      userData : existingUser
    });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    return handleResponse(res, 500, "Server Error", { error: error.message });
  }
};



export const updateAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const { address } = req.body;
    if (!address) return handleResponse(res, 400, "Address required");

    const allowed = {
      name: address.name || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      phone: address.phone || "",
    };

    const user = await User.findByIdAndUpdate(userId, { address: allowed }, { new: true }).select("-password");
    if (!user) return handleResponse(res, 404, "User not found");

    return handleResponse(res, 200, "Address updated", user);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};
 
export const getAddresses = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const user = await User.findById(userId).select("addresses");
    if (!user) return handleResponse(res, 404, "User not found");

    return handleResponse(res, 200, "Addresses fetched", user.addresses || []);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};
 
export const addAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const { address } = req.body;
    if (!address || !address.line1) return handleResponse(res, 400, "Address line1 is required");

    const user = await User.findById(userId);
    if (!user) return handleResponse(res, 404, "User not found");

    const newAddress = {
      name: address.name || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      phone: address.phone || "",
      isDefault: address.isDefault || false,
    };
 
    if (newAddress.isDefault) {
      (user.addresses || []).forEach(addr => {
        addr.isDefault = false;
      });
    }
 
    if (!user.addresses || user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses = user.addresses || [];
    user.addresses.push(newAddress);
    await user.save();

    return handleResponse(res, 201, "Address added", newAddress);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};
 
export const updateAddressById = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const { addressId } = req.params;
    const { address } = req.body;
    if (!address) return handleResponse(res, 400, "Address data required");

    const user = await User.findById(userId);
    if (!user) return handleResponse(res, 404, "User not found");

    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return handleResponse(res, 404, "Address not found");
    }
 
    if (address.isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
 
    const addrToUpdate = user.addresses[addressIndex];
    if (address.name !== undefined) addrToUpdate.name = address.name;
    if (address.line1 !== undefined) addrToUpdate.line1 = address.line1;
    if (address.line2 !== undefined) addrToUpdate.line2 = address.line2;
    if (address.city !== undefined) addrToUpdate.city = address.city;
    if (address.state !== undefined) addrToUpdate.state = address.state;
    if (address.pincode !== undefined) addrToUpdate.pincode = address.pincode;
    if (address.phone !== undefined) addrToUpdate.phone = address.phone;
    if (address.isDefault !== undefined) addrToUpdate.isDefault = address.isDefault;

    await user.save();

    return handleResponse(res, 200, "Address updated", user.addresses[addressIndex]);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};
 
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");

    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) return handleResponse(res, 404, "User not found");

    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return handleResponse(res, 404, "Address not found");
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    return handleResponse(res, 200, "Address deleted");
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return handleResponse(res, 401, "Unauthorized");
    const user = await User.findById(userId).select("-password");
    if (!user) return handleResponse(res, 404, "User not found");
    return handleResponse(res, 200, "User fetched", user);
  } catch (err) {
    return handleResponse(res, 500, "Server Error", { error: err.message });
  }
};


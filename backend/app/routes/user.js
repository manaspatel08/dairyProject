import express from "express";
import { createSuperAdmin, loginUser, registerCustomer ,getMe, updateAddress, getAddresses, addAddress, updateAddressById, deleteAddress } from "../controller/user.js";
import { registerAdmin } from "../controller/adminController.js";
import { verifyToken } from "../middleware/auth.js";


const router = express.Router();

router.post("/superAdmin", createSuperAdmin);

router.post("/admin", registerAdmin);

router.post("/customer", registerCustomer);

router.post("/login", loginUser);

//router.get("/me", verifyToken, getMyProfile);

router.get("/me", verifyToken, getMe);
router.put("/address", verifyToken, updateAddress); // Keep for backward compatibility
 
router.get("/addresses", verifyToken, getAddresses);
router.post("/addresses", verifyToken, addAddress);
router.put("/addresses/:addressId", verifyToken, updateAddressById);
router.delete("/addresses/:addressId", verifyToken, deleteAddress);


export default router;

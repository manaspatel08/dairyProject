import express from "express";
import { createOrder, verifyPayment, getUserPayments, adminGetOrders, adminAssignPartnerToOrder } from "../controller/paymentController.js";
import { verifyToken, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyToken);

router.post("/order", createOrder);
router.post("/verify", verifyPayment);
router.get("/me", getUserPayments);
router.get("/admin/orders", allowRoles("admin", "super_admin"), adminGetOrders);
router.put("/admin/assign-order/:paymentId", allowRoles("admin", "super_admin"), adminAssignPartnerToOrder);

export default router;

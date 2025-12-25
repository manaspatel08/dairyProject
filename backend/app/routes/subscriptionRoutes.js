import express from "express";
import { verifyToken, allowRoles } from "../middleware/auth.js";
import { createSubscription, getUserSubscriptions, adminListSubscriptions, adminAssignPartner } from "../controller/subscriptionController.js";

const router = express.Router();

router.post("/create", verifyToken, createSubscription);
router.get("/me", verifyToken, getUserSubscriptions);

router.get("/admin/list", verifyToken, allowRoles("admin","super_admin"), adminListSubscriptions);
router.put("/admin/assign/:id", verifyToken, allowRoles("admin","super_admin"), adminAssignPartner);

export default router;

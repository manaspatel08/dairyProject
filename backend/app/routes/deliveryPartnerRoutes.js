import express from "express";
import { verifyToken, allowRoles } from "../middleware/auth.js";
import { listPartners, createPartner } from "../controller/deliveryPartnerController.js";

const router = express.Router();

router.get("/", verifyToken, allowRoles("admin","super_admin"), listPartners);
router.post("/", verifyToken, allowRoles("admin","super_admin"), createPartner);

export default router;

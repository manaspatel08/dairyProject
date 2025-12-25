import express from "express";
import { createStore, getStoreByOwner } from "../controller/storeController.js";
import { verifyToken, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, allowRoles("admin"), createStore);
router.get("/my-store", verifyToken, allowRoles("admin"), getStoreByOwner);

export default router;


import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {saveSubscriptionDraft,getSubscriptionDraft,clearSubscriptionDraft} from "../controller/subscriptionDraftController.js";

const router = express.Router();

router.use(verifyToken);

router.post("/save", saveSubscriptionDraft);
router.get("/me", getSubscriptionDraft);
router.delete("/clear", clearSubscriptionDraft);

export default router;

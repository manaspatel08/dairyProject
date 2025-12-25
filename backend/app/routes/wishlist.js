import express from "express";
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist 
} from "../controller/wishlistController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, getWishlist);

router.post("/add", verifyToken, addToWishlist);

router.delete("/remove/:productId", verifyToken, removeFromWishlist);

export default router;

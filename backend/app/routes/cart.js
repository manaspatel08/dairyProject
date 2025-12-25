import express from "express";
import { addToCart, deleteFromCart, incrementProduct, decrementProduct ,getCart} from "../controller/cartController.js";
import { verifyToken } from "../middleware/auth.js"; 

const router = express.Router();


router.get("/", verifyToken, getCart);
router.post("/addtocart", verifyToken, addToCart);
router.delete("/deletefromcart/:productId", verifyToken, deleteFromCart);
router.post("/incrementproduct", verifyToken, incrementProduct);
router.post("/decrementproduct", verifyToken, decrementProduct);

export default router;

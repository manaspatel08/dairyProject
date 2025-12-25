import express from "express";
import {createProduct,updateProduct,deleteProduct,getAllProducts,getProductByStore,getProductById,searchProducts,} from "../controller/productController.js";
import { verifyToken, allowRoles } from "../middleware/auth.js";
import upload from "../middleware/fileUploader.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/store/:storeId", getProductByStore);
 
router.get("/search", searchProducts);

router.get("/:id", getProductById);
 
// router.post("/",verifyToken,setBaseUrl,upload.single("imageUrl"),createProduct);
router.post("/", verifyToken, upload.single("imageUrl"), createProduct);

router.put("/:id", verifyToken, allowRoles("admin", "super_admin"),  upload.single("imageUrl"),updateProduct);
router.delete("/:id",verifyToken,allowRoles("admin", "super_admin"),deleteProduct);

export default router;

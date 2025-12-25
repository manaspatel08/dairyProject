import express from "express";
import { createCategory,getCategoriesByStore,deleteCategory,updateCategory,getAllCategories} from "../controller/categoryController.js";
import { verifyToken, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.get("/:storeId", getCategoriesByStore);

router.get("/",getAllCategories)

router.post( "/",verifyToken,allowRoles("admin", "super_admin"),createCategory);

router.delete("/:id",verifyToken,allowRoles("admin", "super_admin"),deleteCategory)

router.put("/:id",verifyToken,allowRoles("admin", "super_admin"),updateCategory)



export default router;

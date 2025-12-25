import userRoutes from "../routes/user.js";
import productRoutes from "../routes/product.js";
import categoryRoutes from "../routes/category.js";
import storeRoutes from "../routes/store.js";
import cartRoutes from "../routes/cart.js";
import wishlistRoutes from "../routes/wishlist.js";
import subscriptionRoutes from "../routes/subscriptionRoutes.js";
import deliveryPartnerRoutes from "../routes/deliveryPartnerRoutes.js";
  import paymentRoutes from "../routes/paymentRoutes.js";
  import subscriptionDraftRoutes from "../routes/subscriptionDraftRoutes.js"
  import contactRoutes from "../routes/contactRoutes.js"

const setUpRoutes = (app) => {
  app.use("/users", userRoutes);
  app.use("/products", productRoutes);
  app.use("/categories", categoryRoutes);
  app.use("/stores", storeRoutes);
  app.use("/cart", cartRoutes);
  app.use("/wishlist", wishlistRoutes);
  app.use("/subscriptions", subscriptionRoutes);
  app.use("/delivery-partners", deliveryPartnerRoutes);
  app.use("/payments", paymentRoutes);
  app.use("/subscription-draft", subscriptionDraftRoutes);
  app.use("/contact",contactRoutes)
};

export default setUpRoutes;

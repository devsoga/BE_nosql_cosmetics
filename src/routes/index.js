import express from "express";
import {productRoutes} from "./productRoute.js";
import {userRoutes} from "./userRoute.js";
import {cartRoutes} from "./cartRoute.js";
import {orderRoutes} from "./orderRoute.js";
import {favoriteRoute} from "./favoriteRoute.js";
import {sepayRoutes} from "./sepayRoute.js";
import {historyTransferRoute} from "./historyTransferRoute.js";
import {commentRoutes} from "./commentRoute.js";
import adminRoute from "./adminRoute.js";

export const API = express.Router();

API.use("/cosmetics", productRoutes);
API.use("/categories", productRoutes); // For category filtering
API.use("/brands", productRoutes); // For brand filtering
API.use("/user", userRoutes);
API.use("/cart", cartRoutes);
API.use("/order", orderRoutes);
API.use("/wishlist", favoriteRoute); // Renamed to wishlist
API.use("/payment", sepayRoutes);
API.use("/transaction-history", historyTransferRoute);
API.use("/reviews", commentRoutes); // Renamed to reviews
API.use("/admin", adminRoute); // Admin panel

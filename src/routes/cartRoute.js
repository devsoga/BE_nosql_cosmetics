import express from "express";
import {cartValidation} from "../validations/cartValidation.js";
import {cartController} from "../controller/cartController.js";

export const cartRoutes = express.Router();

cartRoutes
  .route("/create-new")
  .post(cartValidation.validValue, cartController.createNew);

cartRoutes.route("/get-cart").post(cartController.getAllCart);

cartRoutes
  .route("/get-all-cart-by-product-id")
  .post(cartController.getAllCartByProductId);
cartRoutes
  .route("/get-cartId-by-product-id-and-size")
  .post(cartController.getCartIdByProductIdAndSize);

cartRoutes.route("/update-quantity").put(cartController.updateQuantity);
cartRoutes.route("/update-size").put(cartController.updateSize);
cartRoutes.route("/delete-cart").delete(cartController.deleteCart);
cartRoutes.route("/delete-all-cart").delete(cartController.deleteAllCart);

import express from "express";
import {orderValidation} from "../validations/orderValidation.js";
import {orderController} from "../controller/orderController.js";

export const orderRoutes = express.Router();

orderRoutes
  .route("/create-new")
  .post(orderValidation.validValue, orderController.createNew);
orderRoutes.route("/get-order-by-id").post(orderController.getById);
orderRoutes
  .route("/get-order-by-userId")
  .post(orderController.getOrderByUserId);

orderRoutes
  .route("/update-status-by-id")
  .post(orderController.updateStatusById);

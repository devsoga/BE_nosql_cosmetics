import express from "express";
import {sepayController} from "../controller/sepayController.js";
import {TokenSepay} from "../middlewares/sepayAuth.js";

export const sepayRoutes = express.Router();

sepayRoutes
  .route("/checkPayment")
  .post(TokenSepay.sepayAuth, sepayController.checkSepay);

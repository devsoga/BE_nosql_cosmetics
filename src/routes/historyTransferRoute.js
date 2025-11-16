import express from "express";
import {historyTransferController} from "../controller/historyTransferController.js";

export const historyTransferRoute = express.Router();

historyTransferRoute
  .route("/find-one-by-orderId")
  .post(historyTransferController.findOneByOrderId);

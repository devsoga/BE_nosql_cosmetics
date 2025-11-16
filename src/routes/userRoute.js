import express from "express";
import {userValidation} from "../validations/userValidation.js";
import {userController} from "../controller/userController.js";

export const userRoutes = express.Router();

userRoutes
  .route("/signup")
  .post(userValidation.validValue, userController.createNew);
userRoutes.route("/login").post(userController.login);

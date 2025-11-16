import express from "express";
import {commentController} from "../controller/commentController.js";

export const commentRoutes = express.Router();

// Create new review
commentRoutes.route("/create").post(commentController.createNew);

// Get all reviews for a product
commentRoutes
  .route("/product/:id")
  .get(commentController.findAllCommentByProductId);

// Get reviews with pagination
commentRoutes
  .route("/product/:id/paginated")
  .get(commentController.getReviewsPaginated);

// Update review
commentRoutes.route("/update/:id").put(commentController.updateReview);

// Delete review
commentRoutes.route("/delete").delete(commentController.deleteCommentById);

// Get review statistics
commentRoutes.route("/stats/:productId").get(commentController.getReviewStats);

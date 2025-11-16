import express from "express";
import {favoriteController} from "../controller/favoriteController.js";

export const favoriteRoute = express.Router();

// Add to wishlist
favoriteRoute.route("/add").post(favoriteController.createNew);

// Get user's wishlist
favoriteRoute.route("/user/:userId").get(favoriteController.getUserWishlist);

// Check if product is in wishlist
favoriteRoute
  .route("/check/:userId/:productId")
  .get(favoriteController.checkProductInWishlist);

// Get wishlist item by ID
favoriteRoute.route("/item/:id").get(favoriteController.getById);

// Toggle wishlist (add/remove)
favoriteRoute.route("/toggle").post(favoriteController.toggleWishlist);

// Remove from wishlist
favoriteRoute.route("/remove").delete(favoriteController.deleteFavorite);

// Clear entire wishlist
favoriteRoute
  .route("/clear/:userId")
  .delete(favoriteController.clearUserWishlist);

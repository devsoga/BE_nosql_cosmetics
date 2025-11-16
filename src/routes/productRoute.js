import express from "express";
import {productValidation} from "../validations/productValidation.js";
import {productController} from "../controller/productController.js";

export const productRoutes = express.Router();

// Main cosmetics routes
productRoutes
  .route("/")
  .get(productController.getAllProducts)
  .post(productValidation.createNew, productController.createNew);

// Search and filter routes
productRoutes.route("/search").post(productController.searchItem);
productRoutes.route("/category/:category").get(productController.getByCategory);
productRoutes.route("/brand/:brand").get(productController.getByBrand);
productRoutes.route("/price-range").post(productController.getByPriceRange);

// Featured and popular products
productRoutes.route("/featured").get(productController.getFeaturedProducts);
productRoutes.route("/popular").get(productController.getPopularProducts);

// Category and brand listings
productRoutes.route("/categories/all").get(productController.getAllCategories);
productRoutes.route("/brands/all").get(productController.getAllBrands);

// Single product
productRoutes.route("/:id").get(productController.getOneById);

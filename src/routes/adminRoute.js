import express from "express";
import {adminController} from "../controller/adminController.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Dashboard
router.get("/", adminController.dashboard);
router.get("/dashboard", adminController.dashboard);

// Products Management
router.get("/products", adminController.products);
router.get("/products/add", adminController.addProductForm);
router.post(
  "/products/add",
  upload.array("images", 5),
  adminController.addProduct
);
router.get("/products/edit/:id", adminController.editProductForm);
router.post(
  "/products/edit/:id",
  upload.array("images", 5),
  adminController.editProduct
);
router.post("/products/delete/:id", adminController.deleteProduct);
router.post(
  "/products/delete-multiple",
  adminController.deleteMultipleProducts
);

// Orders Management
router.get("/orders", adminController.orders);

// Users Management
router.get("/users", adminController.users);

// Reviews Management
router.get("/reviews", adminController.reviews);

// Analytics
router.get("/analytics", adminController.analytics);

export default router;

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
router.get("/products/export", adminController.exportProducts); // <-- THÊM DÒNG NÀY
router.get("/products/add", adminController.addProductForm);



// ... (các route khác)
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
router.get("/orders/view/:id", adminController.viewOrderDetails); // <-- THÊM DÒNG NÀY
router.get("/orders/edit/:id", adminController.editOrderForm); // 1. Hiển thị form
router.post("/orders/update/:id", adminController.updateOrder); // 2. Xử lý cập nhật
router.get("/orders/add", adminController.addOrderForm); // 1. Hiển thị form
router.post("/orders/add", adminController.createOrder); // 2. Xử lý tạo đơn
router.get("/orders/export", adminController.exportOrders);
router.post("/orders/delete/:id", adminController.deleteOrder); // <-- THÊM DÒNG NÀY
// Users Management
router.get("/users", adminController.users);
router.get("/users/view/:id", adminController.viewUserDetails);
router.get("/users/edit/:id", adminController.editUserForm);
router.post("/users/update/:id", adminController.updateUser);
router.get("/users/add", adminController.addUserForm); // 1. Hiển thị form thêm
router.post("/users/add", adminController.createUser);
router.post("/users/delete/:id", adminController.deleteUser);
router.post("/users/status/:id", adminController.toggleUserStatus);
router.get("/users/export", adminController.exportUsers); 

// Reviews Management
router.get("/reviews", adminController.reviews);
router.post("/reviews/delete/:id", adminController.deleteReview); // <-- THÊM DÒNG NÀY
router.post("/reviews/approve/:id", adminController.approveReview);
router.get("/reviews/view/:id", adminController.viewReviewDetails); // <-- THÊM DÒNG NÀY

// Analytics
router.get("/analytics", adminController.analytics);

export default router;

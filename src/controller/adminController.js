import {StatusCodes} from "http-status-codes";
import {productService} from "../services/productService.js";
import {userService} from "../services/userService.js";
import {orderService} from "../services/orderService.js";
import {commentService} from "../services/commentService.js";
import fs from "fs";
import path from "path";
import ExcelJS from 'exceljs';
// ... (các import khác)

// Dashboard
const dashboard = async (req, res, next) => {
  try {
    // Get real data from MongoDB
    const [products, users, orders] = await Promise.all([
      productService.getAllProducts(),
      userService.getAllUsers(),
      orderService.getAllOrders(),
    ]);

    // Calculate real statistics
    const totalRevenue =
      orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;

    // Get category distribution from real products
    const categoryCount = {};
    products?.forEach((product) => {
      const category = product.category || "Other";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categoryChart = Object.entries(categoryCount).map(
      ([category, count]) => ({
        _id: category,
        count,
      })
    );

    // Get recent revenue by day (last 7 days)
    const revenueChart = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayOrders =
        orders?.filter((order) => {
          const orderDate = new Date(order.created_at);
          return orderDate >= dayStart && orderDate < dayEnd;
        }) || [];

      const dayRevenue = dayOrders.reduce(
        (sum, order) => sum + (order.total_price || 0),
        0
      );
      revenueChart.push({
        _id: dayStart.toISOString(),
        revenue: dayRevenue,
      });
    }

    const stats = {
      totalProducts: products?.length || 0,
      totalUsers: users?.length || 0,
      totalOrders: orders?.length || 0,
      totalRevenue,
      revenueChart,
      categoryChart,
    };

    // Get recent orders (last 5)
    const recentOrders =
      orders
        ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        ?.slice(0, 5) || [];

    const topProducts = products?.slice(0, 5) || [];

    res.render("admin/dashboard", {
      title: "Dashboard",
      currentPage: "dashboard",
      stats,
      recentOrders,
      topProducts,
      req,
    });
  } catch (error) {
    next(error);
  }
};

// Products Management
const products = async (req, res, next) => {
  try {
    let allProducts = await productService.getAllProducts();
    const search = req.query.search || "";
    const category = req.query.category || "";
    const brand = req.query.brand || "";

    // Filter by search
    if (search) {
      allProducts = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.category.toLowerCase().includes(search.toLowerCase()) ||
          product.brand.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by category
    if (category) {
      allProducts = allProducts.filter(
        (product) => product.category === category
      );
    }

    // Filter by brand
    if (brand) {
      allProducts = allProducts.filter((product) => product.brand === brand);
    }

    // Get unique categories and brands for filter options
    const allProductsForFilters = await productService.getAllProducts();
    const categories = [
      ...new Set(allProductsForFilters.map((p) => p.category)),
    ].filter(Boolean);
    const brands = [
      ...new Set(allProductsForFilters.map((p) => p.brand)),
    ].filter(Boolean);

    res.render("admin/products", {
      title: "Quản lý sản phẩm",
      currentPage: "products",
      products: allProducts,
      categories,
      brands,
      req,
    });
  } catch (error) {
    next(error);
  }
};

const addProductForm = (req, res) => {
  res.render("admin/product-form", {
    title: "Thêm sản phẩm mới",
    currentPage: "products",
    product: null,
    req,
  });
};

const editProductForm = async (req, res, next) => {
  try {
    const {id} = req.params;
    const product = await productService.getOneById(id); // <-- SỬA TÊN HÀM
    if (!product) {
      return res.status(404).render("admin/products", {
        title: "Quản lý sản phẩm",
        currentPage: "products",
        error: "Không tìm thấy sản phẩm",
        products: [],
        categories: [],
        brands: [],
        req,
      });
    }

    res.render("admin/product-form", {
      title: "Chỉnh sửa sản phẩm",
      currentPage: "products",
      product,
      req,
    });
  } catch (error) {
    next(error);
  }
};

const addProduct = async (req, res, next) => {
  try {
    const productData = {...req.body};

    // === LOGIC LƯU NHÁP MỚI ===
    // 1. Lấy hành động (draft hay publish)
    // Mặc định là 'publish' nếu không có (ví dụ: người dùng bấm Enter)
    const action = productData.action || 'publish';
    
    // 2. Xóa 'action' khỏi data để không bị lỗi Validation
    delete productData.action;

    // 3. Đặt trạng thái (status) dựa trên hành động
    if (action === 'draft') {
      productData.status = 'draft';
    } else {
      productData.status = 'active'; // Đảm bảo là 'active' khi đăng
    }
    // === KẾT THÚC LOGIC MỚI ===


    // === DỌN DẸP DỮ LIỆU (Giữ nguyên) ===
    if (productData.name) productData.name = productData.name.trim();
    if (productData.description) productData.description = productData.description.trim();
    
    if (productData.size && typeof productData.size === 'string') {
      productData.size = productData.size.split(',').map(s => s.trim()).filter(Boolean);
    } else if (!productData.size) {
      productData.size = [];
    }
    if (productData.color && typeof productData.color === 'string') {
      productData.color = productData.color.split(',').map(c => c.trim()).filter(Boolean);
    } else if (!productData.color) {
      productData.color = [];
    }
    // === KẾT THÚC DỌN DẸP ===


    // Handle uploaded images (Giữ nguyên)
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    // Convert string numbers to integers (Giữ nguyên)
    if (productData.price) productData.price = parseInt(productData.price);
    if (productData.original_price)
      productData.original_price = parseInt(productData.original_price);
    if (productData.stock) productData.stock = parseInt(productData.stock);

    // Handle boolean fields (Giữ nguyên)
    productData.featured = productData.featured === "on";
    productData.new_arrival = productData.new_arrival === "on";

    // Lưu vào DB
    await productService.createNew(productData);

    // === THÔNG BÁO TÙY CHỈNH MỚI ===
    if (action === 'draft') {
      res.redirect("/admin/products?success=Đã lưu nháp sản phẩm thành công");
    } else {
      res.redirect("/admin/products?success=Thêm sản phẩm thành công");
    }

  } catch (error) {
    console.error("Add product error:", error);
    res.render("admin/product-form", {
      title: "Thêm sản phẩm mới",
      currentPage: "products",
      product: req.body,
      error: error.message,
      req,
    });
  }
};

const editProduct = async (req, res, next) => {
  try {
    const {id} = req.params;
    const productData = {...req.body};

    // === LOGIC LƯU NHÁP MỚI ===
    // 1. Lấy hành động (draft hay publish)
    const action = productData.action || 'publish';
    
    // 2. Xóa 'action' khỏi data
    delete productData.action;

    // 3. Đặt trạng thái (status)
    if (action === 'draft') {
      productData.status = 'draft';
    } else {
      productData.status = 'active';
    }
    // === KẾT THÚC LOGIC MỚI ===


    // === DỌN DẸP DỮ LIỆU (Giữ nguyên) ===
    if (productData.name) productData.name = productData.name.trim();
    if (productData.description) productData.description = productData.description.trim();
    
    if (productData.size && typeof productData.size === 'string') {
      productData.size = productData.size.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (productData.color && typeof productData.color === 'string') {
      productData.color = productData.color.split(',').map(c => c.trim()).filter(Boolean);
    }
    // === KẾT THÚC DỌN DẸP ===


    // Handle uploaded images (Giữ nguyên)
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    // Handle removed images (Giữ nguyên)
    if (req.body.remove_images) {
      const removeImages = Array.isArray(req.body.remove_images)
        ? req.body.remove_images
        : [req.body.remove_images];

      removeImages.forEach((imagePath) => {
        const fullPath = path.join(process.cwd(), imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    // Convert string numbers to integers (Giữ nguyên)
    if (productData.price) productData.price = parseInt(productData.price);
    if (productData.original_price)
      productData.original_price = parseInt(productData.original_price);
    if (productData.stock) productData.stock = parseInt(productData.stock);

    // Handle boolean fields (Giữ nguyên)
    productData.featured = productData.featured === "on";
    productData.new_arrival = productData.new_arrival === "on";

    // Cập nhật DB
    await productService.updateOneById(id, productData);

    // === THÔNG BÁO TÙY CHỈNH MỚI ===
    if (action === 'draft') {
      res.redirect("/admin/products?success=Đã lưu nháp thành công");
    } else {
      res.redirect("/admin/products?success=Cập nhật sản phẩm thành công");
    }

  } catch (error) {
    console.error("Edit product error:", error);
    res.redirect(
      `/admin/products/edit/${req.params.id}?error=${error.message}`
    );
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const {id} = req.params;

    // Get product to delete images
    const product = await productService.getOneById(id); // <-- SỬA TÊN HÀM
    if (product && product.images) {
      product.images.forEach((imagePath) => {
        // === SỬA LỖI ĐƯỜNG DẪN + KIỂM TRA FILE TỒN TẠI ===
        const fullPath = path.join(process.cwd(), imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await productService.deleteOneById(id);
    res.redirect("/admin/products?success=Xóa sản phẩm thành công");
  } catch (error) {
    console.error("Delete product error:", error);
    res.redirect("/admin/products?error=" + error.message);
  }
};

const deleteMultipleProducts = async (req, res, next) => {
  try {
    const {productIds} = req.body;
    const ids = Array.isArray(productIds) ? productIds : [productIds];

    // Delete images for all products
    for (const id of ids) {
      const product = await productService.getOneById(id); // <-- SỬA TÊN HÀM
      if (product && product.images) {
        product.images.forEach((imagePath) => {
          // === SỬA LỖI ĐƯỜNG DẪN + KIỂM TRA FILE TỒN TẠI ===
          const fullPath = path.join(process.cwd(), imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
      await productService.deleteOneById(id);
    }

    res.redirect(`/admin/products?success=Đã xóa ${ids.length} sản phẩm`);
  } catch (error) {
    console.error("Delete multiple products error:", error);
    res.redirect("/admin/products?error=" + error.message);
  }
};

// Orders Management
const orders = async (req, res, next) => {
  try {
    const mockOrders = []; // Dữ liệu giả
    res.render("admin/orders", {
      title: "Quản lý đơn hàng",
      currentPage: "orders",
      orders: mockOrders,
      req,
    });
  } catch (error) {
    next(error);
  }
};

// Users Management
const users = async (req, res, next) => {
  try {
    const mockUsers = []; // Dữ liệu giả
    res.render("admin/users", {
      title: "Quản lý khách hàng",
      currentPage: "users",
      users: mockUsers,
      req,
    });
  } catch (error) {
    next(error);
  }
};

// Reviews Management
const reviews = async (req, res, next) => {
  try {
    const mockReviews = []; // Dữ liệu giả
    res.render("admin/reviews", {
      title: "Quản lý đánh giá",
      currentPage: "reviews",
      reviews: mockReviews,
      req,
    });
  } catch (error) {
    next(error);
  }
};

// Analytics
const analytics = async (req, res, next) => {
  try {
    const analyticsData = {}; // Dữ liệu giả
    res.render("admin/analytics", {
      title: "Phân tích thống kê",
      currentPage: "analytics",
      analytics: analyticsData,
      req,
    });
  } catch (error) {
    next(error);
  }
};
// Thêm hàm này vào cuối file controller
const exportProducts = async (req, res, next) => {
  try {
    // 1. Lấy tất cả dữ liệu sản phẩm
    const products = await productService.getAllProducts();

    // 2. Tạo một file Excel (Workbook) mới
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sản phẩm'); // Tên của sheet

    // 3. Định nghĩa các cột (headers)
    // 'header' là tên cột, 'key' là tên trường trong data, 'width' là độ rộng
    worksheet.columns = [
      { header: 'ID', key: '_id', width: 30 },
      { header: 'Tên sản phẩm', key: 'name', width: 40 },
      { header: 'Danh mục', key: 'category', width: 20 },
      { header: 'Thương hiệu', key: 'brand', width: 20 },
      { header: 'Giá bán (VNĐ)', key: 'price', width: 15, style: { numFmt: '#,##0' } },
      { header: 'Tồn kho', key: 'stock', width: 10 },
      { header: 'Trạng thái', key: 'status', width: 15 }
    ];

    // 4. Thêm dữ liệu (rows) vào file
    products.forEach(product => {
      worksheet.addRow(product);
    });

    // 5. Thiết lập Header để trình duyệt hiểu đây là 1 file tải về
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="danh_sach_san_pham.xlsx"' // Tên file khi tải về
    );

    // 6. Ghi file Excel ra và gửi về cho người dùng
    await workbook.xlsx.write(res);
    res.end(); // Kết thúc

  } catch (error) {
    // Nếu có lỗi, chuyển cho middleware xử lý
    next(error);
  }
};

export const adminController = {
  dashboard,
  products,
  addProductForm,
  editProductForm,
  addProduct,
  editProduct,
  deleteProduct,
  deleteMultipleProducts,
  orders,
  users,
  reviews,
  analytics,
  exportProducts // <-- THÊM HÀM MỚI VÀO ĐÂY
};
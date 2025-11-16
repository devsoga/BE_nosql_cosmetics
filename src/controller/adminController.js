import {StatusCodes} from "http-status-codes";
import {productService} from "../services/productService.js";
import {userService} from "../services/userService.js";
import {orderService} from "../services/orderService.js";
import {commentService} from "../services/commentService.js";
import fs from "fs";
import path from "path";

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
    const product = await productService.getProductById(id);

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

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    // Convert string numbers to integers
    if (productData.price) productData.price = parseInt(productData.price);
    if (productData.original_price)
      productData.original_price = parseInt(productData.original_price);
    if (productData.stock) productData.stock = parseInt(productData.stock);

    // Handle boolean fields
    productData.featured = productData.featured === "on";
    productData.new_arrival = productData.new_arrival === "on";

    // Set default status
    if (!productData.status) productData.status = "active";

    await productService.createNew(productData);

    res.redirect("/admin/products?success=Thêm sản phẩm thành công");
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

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    // Handle removed images
    if (req.body.remove_images) {
      // Logic to remove images from storage
      const removeImages = Array.isArray(req.body.remove_images)
        ? req.body.remove_images
        : [req.body.remove_images];

      // Remove files from storage
      removeImages.forEach((imagePath) => {
        const fullPath = path.join(process.cwd(), "public", imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    // Convert string numbers to integers
    if (productData.price) productData.price = parseInt(productData.price);
    if (productData.original_price)
      productData.original_price = parseInt(productData.original_price);
    if (productData.stock) productData.stock = parseInt(productData.stock);

    // Handle boolean fields
    productData.featured = productData.featured === "on";
    productData.new_arrival = productData.new_arrival === "on";

    await productService.updateOneById(id, productData);

    res.redirect("/admin/products?success=Cập nhật sản phẩm thành công");
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
    const product = await productService.getProductById(id);
    if (product && product.images) {
      product.images.forEach((imagePath) => {
        const fullPath = path.join(process.cwd(), "public", imagePath);
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
      const product = await productService.getProductById(id);
      if (product && product.images) {
        product.images.forEach((imagePath) => {
          const fullPath = path.join(process.cwd(), "public", imagePath);
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
    // Mock orders data
    const mockOrders = [
      {
        _id: "507f1f77bcf86cd799439011",
        user: {name: "Nguyễn Thị Mai", email: "mai@email.com"},
        total: 850000,
        status: "pending",
        createdAt: new Date(),
      },
      {
        _id: "507f1f77bcf86cd799439012",
        user: {name: "Trần Văn Nam", email: "nam@email.com"},
        total: 1250000,
        status: "delivered",
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        _id: "507f1f77bcf86cd799439013",
        user: {name: "Lê Thị Hoa", email: "hoa@email.com"},
        total: 950000,
        status: "shipped",
        createdAt: new Date(Date.now() - 172800000),
      },
      {
        _id: "507f1f77bcf86cd799439014",
        user: {name: "Phạm Minh Tuấn", email: "tuan@email.com"},
        total: 1650000,
        status: "confirmed",
        createdAt: new Date(Date.now() - 259200000),
      },
    ];

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
    // Mock users data
    const mockUsers = [
      {
        _id: "user001",
        name: "Nguyễn Thị Mai",
        email: "mai@email.com",
        phone: "0901234567",
        totalOrders: 5,
        status: "active",
        createdAt: new Date(Date.now() - 86400000 * 30),
      },
      {
        _id: "user002",
        name: "Trần Văn Nam",
        email: "nam@email.com",
        phone: "0912345678",
        totalOrders: 3,
        status: "active",
        createdAt: new Date(Date.now() - 86400000 * 15),
      },
      {
        _id: "user003",
        name: "Lê Thị Hoa",
        email: "hoa@email.com",
        phone: "0923456789",
        totalOrders: 8,
        status: "active",
        createdAt: new Date(Date.now() - 86400000 * 60),
      },
      {
        _id: "user004",
        name: "Phạm Minh Tuấn",
        email: "tuan@email.com",
        phone: "0934567890",
        totalOrders: 1,
        status: "inactive",
        createdAt: new Date(Date.now() - 86400000 * 5),
      },
    ];

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
    // Mock reviews data
    const mockReviews = [
      {
        _id: "review001",
        product: {
          name: "Kem dưỡng da Nivea",
          category: "Chăm sóc da",
          images: ["/static/images/sample-product.jpg"],
        },
        user: {
          name: "Nguyễn Thị Mai",
          email: "mai@email.com",
        },
        rating: 5,
        comment: "Sản phẩm rất tốt, tôi rất hài lòng",
        status: "approved",
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        _id: "review002",
        product: {
          name: "Son môi Maybelline",
          category: "Trang điểm",
          images: ["/static/images/sample-product2.jpg"],
        },
        user: {
          name: "Trần Thị Lan",
          email: "lan@email.com",
        },
        rating: 4,
        comment: "Màu đẹp, giữ màu lâu",
        status: "pending",
        createdAt: new Date(Date.now() - 172800000),
      },
      {
        _id: "review003",
        product: {
          name: "Nước hoa Chanel",
          category: "Nước hoa",
          images: ["/static/images/sample-product3.jpg"],
        },
        user: {
          name: "Lê Văn Hùng",
          email: "hung@email.com",
        },
        rating: 3,
        comment: "Hương thơm nhẹ nhàng",
        status: "approved",
        createdAt: new Date(Date.now() - 259200000),
      },
    ];

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
    // Mock analytics data
    const analyticsData = {
      totalRevenue: 25750000,
      totalOrders: 156,
      totalCustomers: 127,
      conversionRate: 2.8,
      newCustomers: 28,
      successfulOrders: 142,
      revenueGrowth: 15,
      ordersGrowth: 8,
      customersGrowth: 12,
      conversionGrowth: 0.5,
    };

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
};

import {StatusCodes} from "http-status-codes";
import {productService} from "../services/productService.js";
import {userService} from "../services/userService.js";
import {orderService} from "../services/orderService.js";
import {commentService} from "../services/commentService.js";
import fs from "fs";
import path from "path";
import ExcelJS from 'exceljs';


// Dashboard
// 
// Dashboard - Hiển thị thống kê
// Dashboard - Hiển thị thống kê (Bản sửa lỗi đầy đủ)
const dashboard = async (req, res, next) => {
  try {
    // 1. Lấy dữ liệu thật
    const [products, users, orders] = await Promise.all([
      productService.getAllProducts(),
      userService.getAllUsers(),
      orderService.getAllOrders(),
    ]);

    // Tổng doanh thu
    // Chỉ cộng tiền những đơn ĐÃ GIAO THÀNH CÔNG
  const totalRevenue = orders
  .filter(order => order.status === 'delivered' || order.status === 'completed')
  .reduce((sum, order) => sum + (order.totalPriceOrder || 0), 0);    
    // Tổng khách hàng (Đếm tất cả user không phải là admin)
    // Nếu user chưa có role, mặc định coi là khách hàng
    const totalCustomers = users.filter(user => user.role !== 'admin').length;

    // 3. Tính toán Biểu đồ Doanh thu (7 ngày qua) <-- PHẦN BỊ THIẾU TRƯỚC ĐÂY
    const revenueChart = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Tạo mốc thời gian bắt đầu và kết thúc của ngày
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      // Lọc đơn hàng trong ngày đó
      const dayOrders = orders.filter((order) => {
          const orderDate = new Date(order.createAt || order.createdAt || Date.now());
          return orderDate >= dayStart && orderDate < dayEnd;
      });

      // Cộng tổng tiền các đơn trong ngày
      const dayRevenue = dayOrders.reduce(
        (sum, order) => sum + (order.totalPriceOrder || 0),
        0
      );
      
      revenueChart.push({
        _id: dayStart.toISOString(),
        revenue: dayRevenue,
      });
    }

    // 4. Tính toán Biểu đồ Danh mục (Category Chart)
    const categoryCount = {};
    products.forEach((product) => {
      const category = product.category || "Chưa phân loại";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categoryChart = Object.entries(categoryCount).map(([category, count]) => ({
      _id: category,
      count,
    }));

    // 5. Đóng gói dữ liệu
    const stats = {
      totalProducts: products.length,
      totalUsers: totalCustomers, 
      totalOrders: orders.length,
      totalRevenue: totalRevenue,
      revenueChart, // Dữ liệu cho biểu đồ đường
      categoryChart, // Dữ liệu cho biểu đồ tròn
    };

    // Lấy 5 đơn hàng & sản phẩm mới nhất
    const recentOrders = orders.slice(0, 5);
    const topProducts = products.slice(0, 5);

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
// Dán 2 hàm này vào (thường là trước hàm 'orders')

// 1. HÀM HIỂN THỊ FORM TẠO ĐƠN
const addOrderForm = async (req, res, next) => {
  try {
    // Để tạo đơn, chúng ta cần gửi danh sách khách hàng và sản phẩm
    const allUsers = await userService.getAllUsers();
    const allProducts = await productService.getAllProducts();

    res.render("admin/order-add", {
      title: "Tạo đơn hàng mới",
      currentPage: "orders",
      users: allUsers,
      products: allProducts,
      req,
    });
  } catch (error) {
    next(error);
  }
};

// 2. HÀM XỬ LÝ VIỆC TẠO ĐƠN
const createOrder = async (req, res, next) => {
  try {
    const formData = req.body;

    // ---- XỬ LÝ DỮ LIỆU FORM (PHẦN PHỨC TẠP) ----
    // 1. Lấy thông tin khách hàng
    const user = await userService.getOneById(formData.userId);
    if (!user) {
      throw new Error("Không tìm thấy khách hàng.");
    }

    // 2. Xử lý danh sách sản phẩm
    let listProduct = [];
    let totalPriceOrder = 0;

    // Đảm bảo productIds luôn là một mảng (nếu chỉ chọn 1 sp)
    const productIds = Array.isArray(formData.productIds) ? formData.productIds : [formData.productIds];
    const quantities = Array.isArray(formData.quantities) ? formData.quantities : [formData.quantities];

    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];
      const quantity = parseInt(quantities[i], 10);

      if (productId && quantity > 0) {
        const product = await productService.getOneById(productId);
        if (product) {
          const itemTotalPrice = product.price * quantity;
          listProduct.push({
            productId: product._id.toString(),
            name: product.name,
            size: product.size[0] || 'N/A', // Lấy size đầu tiên làm mặc định
            quantity: quantity,
            price: product.price,
            totalPrice: itemTotalPrice
          });
          totalPriceOrder += itemTotalPrice;
        }
      }
    }

    if (listProduct.length === 0) {
      throw new Error("Vui lòng chọn ít nhất 1 sản phẩm.");
    }

    // 3. Tạo đối tượng đơn hàng hoàn chỉnh
// 3. Tạo đối tượng đơn hàng hoàn chỉnh
  const newOrderData = {
    userId: user._id.toString(), // ID của user đã chọn
    listProduct: listProduct,
    totalPriceOrder: totalPriceOrder,

    // === SỬA LỖI: Lấy thông tin từ FORM, không phải từ USER ===
    firstName: formData.firstName.trim(), 
    lastName: formData.lastName.trim(),
    email: formData.email.trim(),
    phoneNumber: formData.phoneNumber.trim(),

    // Lấy thông tin vận chuyển từ form
    streetAddress: formData.streetAddress.trim(),
    city: formData.city.trim(),
    country: formData.country.trim(),

    // Các trường khác
    paymentMethod: formData.paymentMethod,
    status: formData.status,
    isPayment: formData.isPayment === 'on',
    note: formData.note || "",
  };
// ---- KẾT THÚC XỬ LÝ DỮ LIỆU ----
    // ---- KẾT THÚC XỬ LÝ DỮ LIỆU ----

    // 4. Gọi service mới để tạo đơn
    await orderService.createAdminOrder(newOrderData);

    res.redirect("/admin/orders?success=Tạo đơn hàng mới thành công");

  } catch (error) {
    console.error("Create Order Error:", error);
    res.redirect(`/admin/orders/add?error=${error.message}`);
  }
};
// Orders Management
const orders = async (req, res, next) => {
  try {
    // 1. Lấy TẤT CẢ đơn hàng (đã có thông tin khách hàng)
    let allOrders = await orderService.getAllOrders();

    // 2. Lấy các tham số lọc từ URL (query params)
    const search = req.query.search || '';
    const status = req.query.status || '';
    const date = req.query.date || '';

    // 3. Lọc bằng JavaScript (giống như trang sản phẩm)

    // Lọc theo Search (Mã đơn, Tên KH, Email)
    // Lọc theo Search (Mã đơn, Tên KH, Email)
    if (search) {
      let searchLower = search.toLowerCase().trim();
      
      // Mẹo nhỏ: Nếu người dùng gõ dấu '#' (ví dụ: #654abc), ta xóa nó đi để tìm đúng ID trong DB
      if (searchLower.startsWith('#')) {
        searchLower = searchLower.substring(1);
      }
      
      allOrders = allOrders.filter(order => {
        // 1. Lấy thông tin khách hàng
        const firstName = order.firstName || (order.customerDetails ? order.customerDetails.firstName : '') || '';
        const lastName = order.lastName || (order.customerDetails ? order.customerDetails.lastName : '') || '';
        const email = order.email || (order.customerDetails ? order.customerDetails.email : '') || '';
        
        // Ghép thành tên đầy đủ
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        
        // 2. Lấy Mã đơn hàng (Chuyển đổi an toàn sang chuỗi)
        const orderId = String(order._id).toLowerCase();
        
        // 3. Kiểm tra xem từ khóa có nằm trong (ID) HOẶC (Tên) HOẶC (Email) không
        return (
          orderId.includes(searchLower) ||            // Tìm theo Mã đơn (kể cả tìm 1 phần mã)
          fullName.includes(searchLower) ||           // Tìm theo Tên khách
          email.toLowerCase().includes(searchLower)   // Tìm theo Email
        );
      });
    }

    // Lọc theo Trạng thái
    if (status) {
      allOrders = allOrders.filter(order => order.status === status);
    }

    // Lọc theo Ngày
    if (date) {
      // Chuyển đổi ngày lọc (ví dụ: "mm/dd/yyyy" hoặc "yyyy-mm-dd" sang object Date)
      const filterDate = new Date(date);

      allOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createAt);
        // So sánh ngày, tháng, năm (bỏ qua giờ, phút, giây)
        return orderDate.toDateString() === filterDate.toDateString();
      });
    }

    // 4. Render ra view với dữ liệu đã lọc
    res.render("admin/orders", {
      title: "Quản lý đơn hàng",
      currentPage: "orders",
      orders: allOrders, // Truyền danh sách đơn hàng thật đã lọc
      req, // Truyền req để giữ lại giá trị lọc trên thanh filter
    });

  } catch (error) {
    next(error);
  }
};
// Dán hàm này vào sau hàm 'orders'
const viewOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params; // Lấy ID từ URL

    // Gọi service để lấy chi tiết 1 đơn hàng
    const order = await orderService.getAdminOrderById(id);

    if (!order) {
      // Nếu không tìm thấy đơn hàng, báo lỗi
      return res.redirect("/admin/orders?error=Không tìm thấy đơn hàng");
    }

    // Render ra file view mới, và truyền data của đơn hàng vào
    res.render("admin/order-details", {
      title: "Chi tiết đơn hàng",
      currentPage: "orders", // Vẫn giữ sidebar "Orders" sáng
      order: order, // Dữ liệu đơn hàng
      req,
    });

  } catch (error) {
    next(error);
  }
};
// Dán 2 hàm này vào sau hàm 'viewOrderDetails'

// 1. HÀM HIỂN THỊ TRANG CHỈNH SỬA
const editOrderForm = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Dùng lại hàm service để lấy chi tiết 1 đơn hàng
    const order = await orderService.getAdminOrderById(id);

    if (!order) {
      return res.redirect("/admin/orders?error=Không tìm thấy đơn hàng");
    }

    // Render ra file view mới (chúng ta sẽ tạo ở bước 3)
    res.render("admin/order-edit", {
      title: "Cập nhật đơn hàng",
      currentPage: "orders",
      order: order,
      req,
    });

  } catch (error) {
    next(error);
  }
};

// 2. HÀM XỬ LÝ VIỆC CẬP NHẬT
// THAY THẾ HÀM CŨ 'updateOrderStatus' BẰNG HÀM NÀY

const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Lấy tất cả dữ liệu từ form
    const { status, streetAddress, city, country, isPayment } = req.body;

    // 2. Tạo một đối tượng data sạch để cập nhật
    // 2. Tạo một đối tượng data sạch để cập nhật
const updateData = {
  status: status,
  streetAddress: (streetAddress || '').trim(),
  city: (city || '').trim(),
  country: (country || '').trim(),
};

    // 3. Gọi service TỔNG QUÁT mới
    await orderService.updateOrderById(id, updateData);

    // Chuyển hướng về trang danh sách với thông báo
    res.redirect("/admin/orders?success=Cập nhật đơn hàng thành công");

  } catch (error) {
    console.error("Update Order Error:", error);
    res.redirect(`/admin/orders/edit/${req.params.id}?error=${error.message}`);
  }
};
// Users Management
// Users Management
const users = async (req, res, next) => {
  try {
    // 1. Lấy toàn bộ danh sách users thật
    let allUsers = await userService.getAllUsers();
    
    // 2. Xử lý tìm kiếm (nếu có)
    const search = req.query.search || "";
    
    if (search) {
      const searchLower = search.toLowerCase().trim();
      
      allUsers = allUsers.filter(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const phone = (user.phoneNumber || '');

        return (
          fullName.includes(searchLower) || // Tìm theo tên
          email.includes(searchLower) ||    // Tìm theo email
          phone.includes(searchLower)       // Tìm theo SĐT
        );
      });
    }

    // 3. Render ra giao diện
    res.render("admin/users", {
      title: "Quản lý khách hàng",
      currentPage: "users",
      users: allUsers, // Truyền danh sách user thật
      req,
    });
  } catch (error) {
    next(error);
  }
};
// Hàm xử lý xóa đơn hàng
const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Gọi service để xóa mềm
    await orderService.deleteOrderById(id);

    // Quay lại trang danh sách với thông báo
    res.redirect("/admin/orders?success=Xóa đơn hàng thành công");
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
// Hàm xem chi tiết khách hàng
const viewUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Gọi service lấy data
    const data = await userService.getUserDetails(id);
    
    if (!data) {
      return res.redirect("/admin/users?error=Không tìm thấy khách hàng");
    }

    res.render("admin/user-details", {
      title: "Chi tiết khách hàng",
      currentPage: "users",
      user: data.user,
      orders: data.orders, // Truyền danh sách đơn hàng qua view
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
// Dán hàm này vào chung với các hàm export khác
const exportOrders = async (req, res, next) => {
  try {
    // 1. Lấy tất cả dữ liệu đơn hàng (đã có thông tin user)
    const orders = await orderService.getAllOrders();

    // 2. Tạo file Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Đơn hàng');

    // 3. Định nghĩa các cột
    worksheet.columns = [
      { header: 'Mã đơn', key: '_id', width: 30 },
      { header: 'Tên Khách hàng', key: 'customerName', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'SĐT', key: 'phoneNumber', width: 15 },
      { header: 'Địa chỉ', key: 'address', width: 40 },
      { header: 'Tổng tiền (VNĐ)', key: 'totalPriceOrder', width: 20, style: { numFmt: '#,##0' } },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Thanh toán', key: 'isPaymentStatus', width: 15 },
      { header: 'Ngày tạo', key: 'createAt', width: 20, style: { numFmt: 'dd/mm/yyyy' } }
    ];

    // 4. Thêm dữ liệu vào
    orders.forEach(order => {
      let customerName;
      if (order.customerDetails) {
        customerName = order.customerDetails.firstName + ' ' + order.customerDetails.lastName;
      } else {
        customerName = order.firstName + ' ' + order.lastName;
      }

      worksheet.addRow({
        _id: order._id,
        customerName: customerName,
        email: order.email,
        phoneNumber: order.phoneNumber,
        address: `${order.streetAddress}, ${order.city}, ${order.country}`,
        totalPriceOrder: order.totalPriceOrder,
        status: order.status,
        isPaymentStatus: order.isPayment ? 'Đã thanh toán' : 'Chưa thanh toán',
        createAt: new Date(order.createAt)
      });
    });

    // 5. Gửi file về trình duyệt
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="danh_sach_don_hang.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    next(error);
  }
};
// 1. HIỂN THỊ FORM SỬA USER
const editUserForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getOneById(id); // Dùng lại hàm có sẵn

    if (!user) {
      return res.redirect("/admin/users?error=Không tìm thấy khách hàng");
    }

    res.render("admin/user-edit", {
      title: "Cập nhật khách hàng",
      currentPage: "users",
      user: user,
      req,
    });
  } catch (error) {
    next(error);
  }
};

// 2. XỬ LÝ CẬP NHẬT USER
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    // Chuẩn bị dữ liệu sạch
    const updateData = {
      firstName: (formData.firstName || '').trim(),
      lastName: (formData.lastName || '').trim(),
      phoneNumber: (formData.phoneNumber || '').trim(),
      address: (formData.address || '').trim(),
      role: formData.role,     // 'client' hoặc 'admin'
      status: formData.status, // 'active', 'inactive', 'blocked'
      verify: formData.verify === 'on' // Checkbox trả về 'on' hoặc undefined
    };

    await userService.updateUserById(id, updateData);

    res.redirect("/admin/users?success=Cập nhật khách hàng thành công");
  } catch (error) {
    next(error);
  }
};
// 1. HIỂN THỊ FORM THÊM USER
const addUserForm = (req, res) => {
  res.render("admin/user-add", {
    title: "Thêm khách hàng mới",
    currentPage: "users",
    req,
  });
};

// 2. XỬ LÝ TẠO USER MỚI
const createUser = async (req, res, next) => {
  try {
    const formData = req.body;

    // Chuẩn bị dữ liệu user mới
    const newUser = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password, // Service sẽ lo việc mã hóa (hash)
      phoneNumber: formData.phoneNumber.trim(),
      address: formData.address.trim(),
      role: formData.role || 'client',
      status: formData.status || 'active',
      verify: formData.verify === 'on' // Checkbox trả về 'on'
    };

    // Gọi service tạo user (hàm này đã có sẵn từ lúc làm chức năng đăng ký)
    const createdUser = await userService.createNew(newUser);

    if (!createdUser) {
      // Nếu hàm trả về null nghĩa là email đã tồn tại
      return res.render("admin/user-add", {
        title: "Thêm khách hàng mới",
        currentPage: "users",
        error: "Email này đã tồn tại trong hệ thống!",
        req,
        oldData: formData // (Tùy chọn) Để giữ lại dữ liệu cũ
      });
    }

    res.redirect("/admin/users?success=Thêm khách hàng thành công");
  } catch (error) {
    next(error);
  }
};
// XỬ LÝ XÓA KHÁCH HÀNG
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getOneById(id);
    if (user && user.role === 'admin') {
      return res.redirect("/admin/users?error=Không thể xóa tài khoản Admin!");
    }

    // Gọi service để xóa mềm
    await userService.deleteUserById(id);

    res.redirect("/admin/users?success=Xóa khách hàng thành công");
  } catch (error) {
    next(error);
  }
};
// HÀM CHUYÊN DỤNG: ĐỔI TRẠNG THÁI (CHẶN/MỞ KHÓA)
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Lấy trạng thái mới từ nút bấm (blocked hoặc active)
    const user = await userService.getOneById(id);
    if (user && user.role === 'admin') {
        return res.redirect("/admin/users?error=Không thể chặn tài khoản Admin!");
    }
    // Gọi service cập nhật (chỉ cập nhật đúng 1 trường status)
    await userService.updateUserById(id, { status: status });

    // Thông báo tùy theo hành động
    const message = status === 'blocked' ? 'Đã chặn khách hàng thành công' : 'Đã mở khóa khách hàng';
    res.redirect(`/admin/users?success=${message}`);
  } catch (error) {
    next(error);
  }
};
// Hàm xuất Excel Khách hàng
const exportUsers = async (req, res, next) => {
  try {
    // 1. Lấy toàn bộ danh sách users (đã có totalOrders)
    const users = await userService.getAllUsers();

    // 2. Tạo file Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Khách hàng');

    // 3. Định nghĩa các cột
    worksheet.columns = [
      { header: 'ID', key: '_id', width: 30 },
      { header: 'Họ và Tên', key: 'fullName', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Số điện thoại', key: 'phoneNumber', width: 20 },
      { header: 'Vai trò', key: 'role', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Tổng đơn hàng', key: 'totalOrders', width: 15 },
      { header: 'Ngày đăng ký', key: 'createdAt', width: 20, style: { numFmt: 'dd/mm/yyyy' } }
    ];

    // 4. Thêm dữ liệu vào
    users.forEach(user => {
      // Xử lý tên (tránh null)
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Khách hàng';

      // Xử lý ngày (tránh lỗi Invalid Date)
      const createdDate = user.createdAt || user.createAt || Date.now();

      worksheet.addRow({
        _id: user._id.toString(),
        fullName: fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || 'Chưa cập nhật',
        role: user.role === 'admin' ? 'Admin' : 'Khách hàng',
        status: user.status,
        totalOrders: user.totalOrders || 0, // Số liệu này lấy từ hàm aggregate
        createdAt: new Date(createdDate)
      });
    });

    // 5. Gửi file về trình duyệt
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="danh_sach_khach_hang.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();

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
  addOrderForm, 
  createOrder,
  orders,
  users,
  reviews,
  analytics,
  exportProducts,
  viewOrderDetails,
  editOrderForm, 
  updateOrder,
  exportOrders,
  deleteOrder,
  viewUserDetails,
  updateUser,
  editUserForm,
  addUserForm,
  createUser,
  deleteUser,
  toggleUserStatus,
  exportUsers,
};
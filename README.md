# Website Bán Mỹ Phẩm - Backend API

## 🚀 Hướng dẫn chạy project

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Kiểm tra file `.env` và đảm bảo MongoDB đang chạy:

```env
MONGO_URI=mongodb://localhost:27017/nosql_mypham
DATABASE_NAME="e_commerse_MERN"
HOST="localhost"
PORT=8080
SEPAY_API_KEY="YOUR_SEPAY_API_KEY"
```

### 3. Chạy migration để thêm dữ liệu mẫu

```bash
npm run migrate
```

Migration sẽ:

- Xóa toàn bộ dữ liệu cũ
- Thêm 12 sản phẩm mỹ phẩm mẫu
- Thêm 5 tài khoản người dùng với mật khẩu đã được hash

### 4. Khởi động server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:8080`

### Thanh toán

- `POST /payment/checkPayment` - Kiểm tra thanh toán Sepay

### Lịch sử giao dịch

- `POST /transaction-history/find-one-by-orderId` - Lấy lịch sử theo đơn hàng

## 📱 API Endpoints

### Base URL: `http://localhost:8080/cosmetics-shop`

### Sản phẩm mỹ phẩm

- `GET /product` - Lấy tất cả sản phẩm
- `GET /product/:id` - Lấy sản phẩm theo ID
- `POST /product` - Tạo sản phẩm mới
- `POST /product/search` - Tìm kiếm sản phẩm

### Người dùng

- `POST /user/signup` - Đăng ký tài khoản
- `POST /user/login` - Đăng nhập

### Giỏ hàng

- `POST /cart/create-new` - Thêm vào giỏ hàng
- `POST /cart/get-cart` - Lấy giỏ hàng theo userId
- `PUT /cart/update-quantity` - Cập nhật số lượng
- `DELETE /cart/delete-cart` - Xóa sản phẩm khỏi giỏ hàng

### Đơn hàng

- `POST /order/create-new` - Tạo đơn hàng
- `POST /order/get-order-by-userId` - Lấy đơn hàng theo userId
- `POST /order/update-status-by-id` - Cập nhật trạng thái đơn hàng

### Yêu thích

- `POST /favorite/create-new` - Thêm vào danh sách yêu thích
- `POST /favorite/get-favorite` - Lấy danh sách yêu thích
- `DELETE /favorite/delete` - Xóa khỏi danh sách yêu thích

### Bình luận

- `POST /comment/create-new` - Tạo bình luận
- `GET /comment/findAllCommentByProductId/:id` - Lấy bình luận theo sản phẩm
- `DELETE /comment/deleteCommentById` - Xóa bình luận

## 👤 Tài khoản test

| Email                | Password | Username     |
| -------------------- | -------- | ------------ |
| admin@cosmetics.com  | 123456   | admin        |
| nguyenvana@gmail.com | 123456   | nguyen_van_a |
| tranthib@yahoo.com   | 123456   | tran_thi_b   |

## 🛍️ Dữ liệu mẫu

### Danh mục sản phẩm mỹ phẩm:

- **Chăm sóc da**: Kem dưỡng ẩm, sữa rửa mặt
- **Serum & Tinh chất**: Vitamin C, các hoạt chất chăm sóc da
- **Trang điểm**: Son môi, cushion, phấn mắt, mascara
- **Chống nắng**: Kem chống nắng cao cấp
- **Tẩy trang**: Nước tẩy trang, dầu tẩy trang
- **Mặt nạ**: Mặt nạ giấy, mặt nạ dưỡng chất
- **Toner & Nước thần**: Toner, nước hoa hồng
- **Nước hoa**: Nước hoa cao cấp

### Thương hiệu:

- La Roche-Posay
- The Ordinary
- Dior
- Anessa
- Bioderma
- Laneige
- Chanel
- SK-II
- Urban Decay
- CeraVe
- Paula's Choice
- Maybelline

## 🔧 Cấu trúc project

```
src/
├── config/          # Cấu hình database và môi trường
├── controller/      # Xử lý request/response
├── middlewares/     # Middleware xác thực và xử lý lỗi
├── models/         # Schema và truy vấn database
├── routes/         # Định nghĩa API routes
├── services/       # Logic nghiệp vụ
├── utils/          # Các hàm tiện ích
├── validations/    # Validation input
└── server.js       # Entry point

data/
└── sampleData.js   # Dữ liệu mẫu mỹ phẩm

migrate.js          # Script migration
```

## 📝 Scripts

- `npm start` - Khởi động server production
- `npm run dev` - Khởi động server development (nodemon)
- `npm run migrate` - Chạy migration thêm dữ liệu mẫu

## 🎯 Tính năng

- ✅ CRUD sản phẩm mỹ phẩm
- ✅ Đăng ký/đăng nhập với password hash (bcrypt)
- ✅ Quản lý giỏ hàng
- ✅ Đặt hàng và theo dõi đơn hàng
- ✅ Danh sách yêu thích
- ✅ Hệ thống bình luận
- ✅ Tích hợp thanh toán Sepay
- ✅ Validation đầu vào với Joi
- ✅ Xử lý lỗi tập trung
- ✅ MongoDB native driver

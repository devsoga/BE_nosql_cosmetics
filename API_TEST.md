## Hướng dẫn test API (routes, input, output)

Base URL: `http://localhost:8080/cosmetics-shop`

Ghi chú: mỗi mục dưới đây mô tả route, method, ví dụ body (request) và ví dụ response (success). Các ID mẫu là placeholder, thay bằng `_id` thực tế từ database nếu cần.

---

**1) Sản phẩm (Cosmetics)**

- GET `/cosmetics` — Lấy tất cả sản phẩm
  - Request: none
  - Response (200):

```json
[
  {
    "_id": "6919b42896fa66f16c91c1e0",
    "name": "Kem Dưỡng Ẩm La Roche-Posay Toleriane Ultra",
    "price": 450000,
    "category": "Chăm sóc da",
    "brand": "La Roche-Posay",
    "description": "...",
    "image": ["https://..."],
    "size": ["50ml", "100ml"],
    "stock": 50
  }
]
```

- GET `/cosmetics/:id` — Lấy 1 sản phẩm theo ID

  - Request: none
  - Response (200): object product (same shape as above)

- POST `/cosmetics` — Tạo sản phẩm (admin)
  - Request body (JSON):

```json
{
  "name": "Tên sản phẩm",
  "price": 123000,
  "description": "Mô tả",
  "image": ["https://..."],
  "category": "Chăm sóc da",
  "brand": "Thương hiệu",
  "size": ["50ml"],
  "stock": 10
}
```

- Response (201): inserted document metadata or full created object

- POST `/cosmetics/search` — Tìm kiếm theo tên

  - Request body (JSON): `{ "name": "serum" }`
  - Response (200): array of matching products

- GET `/cosmetics/category/:category` — Lọc theo danh mục

  - Response (200): array

- GET `/cosmetics/brand/:brand` — Lọc theo thương hiệu

  - Response (200): array

- POST `/cosmetics/price-range` — Lọc theo khoảng giá

  - Request body (JSON): `{ "minPrice": 100000, "maxPrice": 1000000 }`
  - Response (200): array

- GET `/cosmetics/featured` — Sản phẩm nổi bật (ví dụ: top 6 theo giá)

  - Response (200): array

- GET `/cosmetics/popular` — Sản phẩm phổ biến (ví dụ: top 8 theo stock)

  - Response (200): array

- GET `/cosmetics/categories/all` — Lấy danh sách danh mục

  - Response (200): array of strings

- GET `/cosmetics/brands/all` — Lấy danh sách thương hiệu
  - Response (200): array of strings

---

**2) Người dùng (Users)**

- POST `/user/signup` — Đăng ký
  - Request body (JSON):

```json
{
  "username": "test_user",
  "email": "test@example.com",
  "password": "123456"
}
```

- Response (201): created user (password should be omitted)

- POST `/user/login` — Đăng nhập
  - Request body (JSON): `{ "email": "admin@cosmetics.com", "password": "123456" }`
  - Response (200):

```json
{
  "_id": "...",
  "username": "admin",
  "email": "admin@cosmetics.com",
  "createAt": "2025-11-16T11:23:20.8Z",
  "message": "Login successfully!"
}
```

---

**3) Giỏ hàng (Cart)**

- POST `/cart/create-new` — Thêm mục vào giỏ
  - Body:

```json
{
  "userId": "USER_ID",
  "item": {
    "productId": "PRODUCT_ID",
    "name": "Kem Dưỡng Ẩm...",
    "size": "50ml",
    "quantity": 1,
    "image": "https://...",
    "price": 450000
  }
}
```

- Response (201): created cart item

- POST `/cart/get-cart` — Lấy giỏ hàng theo user

  - Body: `{ "userId": "USER_ID" }`
  - Response (200): array of cart items

- PUT `/cart/update-quantity` — Cập nhật số lượng
  - Body: `{ "cartId": "CART_ID", "quantity": 2 }`
  - Response (200): modifiedCount or updated item

---

**4) Wishlist (Favorites)**

- POST `/wishlist/add` — Thêm vào wishlist

  - Body: same shape as cart item but minimal

- GET `/wishlist/user/:userId` — Lấy wishlist của user

- GET `/wishlist/check/:userId/:productId` — Kiểm tra có tồn tại

- POST `/wishlist/toggle` — Thêm/xóa (toggle)
  - Body example:

```json
{
  "userId": "USER_ID",
  "item": {"productId": "PRODUCT_ID", "name": "...", "price": 1200000}
}
```

- Response (200): `{ "action": "added" }` or `{ "action": "removed" }`

- DELETE `/wishlist/clear/:userId` — Xóa toàn bộ wishlist

---

**5) Reviews (Đánh giá / Bình luận)**

- POST `/reviews/create` — Tạo đánh giá
  - Body:

```json
{
  "userId": "USER_ID",
  "productId": "PRODUCT_ID",
  "comment": "Rất tốt!",
  "rating": 5
}
```

- Response (201): created review

- GET `/reviews/product/:productId` — Lấy tất cả review cho sản phẩm

- GET `/reviews/product/:productId/paginated?page=1&limit=5` — Phân trang

- PUT `/reviews/update/:id` — Cập nhật review

- DELETE `/reviews/delete` — Xóa review (body: `{ "commentId": "ID", "userId": "USER_ID" }`)

- GET `/reviews/stats/:productId` — Thống kê (số lượng, avg rating)

---

**6) Đơn hàng & Thanh toán**

- POST `/order/create-new` — Tạo đơn hàng

  - Body: theo `orderValidation` trong `src/validations/orderValidation.js`

- POST `/payment/checkPayment` — Sepay webhook (cần header `Authorization: Apikey <KEY>`)

---

## PowerShell / curl test nhanh

PowerShell examples:

```powershell
# Lấy 3 sản phẩm đầu
Invoke-RestMethod -Uri "http://localhost:8080/cosmetics-shop/cosmetics" -Method GET | Select-Object -First 3 name, price, category | Format-Table

# Tìm kiếm
$body = @{ name = "serum" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/cosmetics-shop/cosmetics/search" -Method POST -Body $body -ContentType "application/json"

# Đăng nhập
$login = @{ email = "admin@cosmetics.com"; password = "123456" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/cosmetics-shop/user/login" -Method POST -Body $login -ContentType "application/json"
```

curl examples:

```bash
curl -s http://localhost:8080/cosmetics-shop/cosmetics | jq '.[0:3]'

curl -s -X POST http://localhost:8080/cosmetics-shop/cosmetics/search -H "Content-Type: application/json" -d '{"name":"serum"}' | jq
```

---

Nếu bạn muốn, tôi có thể tiếp tục:

- Thêm response schema đầy đủ cho mỗi endpoint (status codes, lỗi thường gặp)
- Tạo Postman collection hoặc OpenAPI (swagger) tự động từ routes hiện có

Bạn muốn tôi làm bước nào tiếp theo?

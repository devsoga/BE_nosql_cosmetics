import {env} from "../config/environment.js";
const API_KEY = env.SEPAY_API_KEY;

const sepayAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Lấy Authorization header

  if (!authHeader) {
    return res.status(401).json({message: "Authorization header missing"});
  }

  // Kiểm tra format "Apikey <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Apikey") {
    return res.status(401).json({message: "Invalid authorization format"});
  }

  const token = parts[1];

  // So sánh với API key của bạn (test key lưu trong biến môi trường .env)
  if (token !== API_KEY) {
    return res.status(403).json({message: "Invalid API key"});
  }

  // Nếu ok thì cho đi tiếp
  next();
};

export const TokenSepay = {sepayAuth};

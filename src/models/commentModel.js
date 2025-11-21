// import Joi from "joi";
// import { getDB } from "../config/mongo.js";
// import { ObjectId } from "mongodb";
// // import { userModel } from "./userModel.js"; // Bỏ comment nếu cần dùng

// // 1. SỬA TÊN COLLECTION CHO KHỚP
// const COMMENT_COLLECTION_NAME = "reviews"; 
// const ORDER_COLLECTION_NAME = "orders";

// // 2. SCHEMA
// const COMMENT_COLLECTION_SCHEMA = Joi.object({
//   userId: Joi.string().required(),
//   productId: Joi.string().required(),
  
//   rating: Joi.number().min(1).max(5).default(5),
//   comment: Joi.string().required(), 
//   createdAt: Joi.date().timestamp("javascript").default(() => Date.now()),
//   _destroy: Joi.boolean().default(false),
  
//   // Fields phụ
//   name: Joi.string().optional().allow(""),
//   email: Joi.string().optional().allow(""),
//   avatar: Joi.string().optional().allow(""),
//   content: Joi.string().optional().allow("") 
// });

// const validateBeforeCreate = async (data) => {
//   const validData = await COMMENT_COLLECTION_SCHEMA.validateAsync(data, {
//     abortEarly: false,
//     stripUnknown: true 
//   });

//   // Chuyển đổi ID sang ObjectId
//   const dataReturn = {
//     ...validData,
//     productId: new ObjectId(validData.productId),
//     userId: new ObjectId(validData.userId),
//   };

//   return dataReturn;
// };

// const findOneById = async (id) => {
//   try {
//     const result = await getDB()
//       .collection(COMMENT_COLLECTION_NAME)
//       .findOne({ _id: new ObjectId(id) });
//     return result;
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// const findAllCommentByProductId = async (productId) => {
//   try {
//     const result = await getDB()
//       .collection(COMMENT_COLLECTION_NAME)
//       .find({ productId: new ObjectId(productId) })
//       .sort({ createdAt: -1 }) 
//       .toArray();
//     return result;
//   } catch (error) {
//     throw new Error(`Error fetching comments: ${error.message}`);
//   }
// };

// // --- HÀM TẠO REVIEW (ĐÃ FIX LOGIC) ---
// const createNew = async (data) => {
//   try {
//     // validData lúc này đã chứa ObjectId cho userId và productId
//     const validData = await validateBeforeCreate(data);

//     // 1. CHECK MUA HÀNG
//     // Lưu ý: Trong bảng Orders, productId trong mảng listProduct thường là String.
//     // Nên ta phải dùng .toString() để so sánh.
//     const hasPurchased = await getDB().collection(ORDER_COLLECTION_NAME).findOne({
//       userId: validData.userId, // UserId trong order là ObjectId (theo orderModel cũ)
//       "listProduct.productId": validData.productId.toString(), // Convert về String để khớp DB Orders
//       status: "delivered", // Chỉ cho phép khi đã giao hàng
//       _destroy: false
//     });

//     if (!hasPurchased) {
//       throw new Error("Bạn phải mua và nhận hàng thành công mới được đánh giá!");
//     }

//     // 2. CHECK SPAM (Mỗi người 1 lần)
//     const existingReview = await getDB().collection(COMMENT_COLLECTION_NAME).findOne({
//       userId: validData.userId,
//       productId: validData.productId,
//       _destroy: false
//     });

//     if (existingReview) {
//       throw new Error("Bạn đã đánh giá sản phẩm này rồi!");
//     }

//     // 3. LƯU VÀO DB
//     // Lúc này dùng validData (đã là ObjectId) để lưu vào Reviews
//     const result = await getDB().collection(COMMENT_COLLECTION_NAME).insertOne(validData);
    
//     return { ...result, success: true, message: "Create comment successfully!" };
//   } catch (error) {
//     // Ném lỗi message string để Controller bắt được
//     throw new Error(error.message);
//   }
// };

// const deleteCommentById = async (commentId, userId) => {
//   try {
//     const result = await getDB()
//       .collection(COMMENT_COLLECTION_NAME)
//       .deleteOne({ _id: new ObjectId(commentId) });

//     if (result.deletedCount === 0) {
//       throw new Error("Comment not found or already deleted");
//     }

//     return { success: true, message: "Comment deleted successfully!" };
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// export const commentModel = {
//   findOneById,
//   findAllCommentByProductId,
//   deleteCommentById,
//   createNew,
// };
import Joi from "joi";
import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";
// 1. Import Redis
import redisClient from "../config/redis.js"; 

const COMMENT_COLLECTION_NAME = "reviews"; 
const ORDER_COLLECTION_NAME = "orders";

// --- SCHEMA ---
const COMMENT_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required(),
  productId: Joi.string().required(),
  rating: Joi.number().min(1).max(5).default(5),
  comment: Joi.string().required(), 
  createdAt: Joi.date().timestamp("javascript").default(() => Date.now()),
  _destroy: Joi.boolean().default(false),
  name: Joi.string().optional().allow(""),
  email: Joi.string().optional().allow(""),
  avatar: Joi.string().optional().allow(""),
  content: Joi.string().optional().allow("") 
});

const validateBeforeCreate = async (data) => {
  const validData = await COMMENT_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false, stripUnknown: true 
  });
  return {
    ...validData,
    productId: new ObjectId(validData.productId),
    userId: new ObjectId(validData.userId),
  };
};

// --- CÁC HÀM XỬ LÝ ---

const findOneById = async (id) => {
  try {
    return await getDB().collection(COMMENT_COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  } catch (error) { throw new Error(error); }
};

// 2. HÀM LẤY DANH SÁCH (CÓ CACHE REDIS)
const findAllCommentByProductId = async (productId) => {
  try {
    const key = `reviews:${productId}`; // Tạo Key: reviews:ID_SAN_PHAM

    // A. Kiểm tra Redis trước
    const cachedData = await redisClient.get(key);
    if (cachedData) {
        console.log("✅ Lấy Reviews từ Redis Cache");
        return JSON.parse(cachedData);
    }

    // B. Nếu không có -> Tìm trong MongoDB
    console.log("⚡ Lấy Reviews từ MongoDB");
    const result = await getDB()
      .collection(COMMENT_COLLECTION_NAME)
      .find({ productId: new ObjectId(productId) })
      .sort({ createdAt: -1 }) 
      .toArray();

    // C. Lưu vào Redis (Hết hạn sau 1 giờ)
    await redisClient.set(key, JSON.stringify(result), { EX: 3600 });

    return result;
  } catch (error) {
    throw new Error(`Error fetching comments: ${error.message}`);
  }
};

// 3. HÀM TẠO MỚI (XÓA CACHE)
const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);

    // Check mua hàng & Spam (Giữ nguyên logic cũ)
    const hasPurchased = await getDB().collection(ORDER_COLLECTION_NAME).findOne({
      $or: [{ userId: validData.userId }, { userId: validData.userId.toString() }],
      "listProduct.productId": validData.productId.toString(),
      status: { $in: ["pending", "confirmed", "shipped", "delivered"] }, 
      _destroy: false
    });
    if (!hasPurchased) throw new Error("Bạn phải mua và nhận hàng thành công mới được đánh giá!");

    const existingReview = await getDB().collection(COMMENT_COLLECTION_NAME).findOne({
      userId: validData.userId, productId: validData.productId, _destroy: false
    });
    if (existingReview) throw new Error("Bạn đã đánh giá sản phẩm này rồi!");

    // Lưu MongoDB
    const result = await getDB().collection(COMMENT_COLLECTION_NAME).insertOne(validData);

    // === QUAN TRỌNG: XÓA CACHE REDIS ===
    // Có comment mới -> Cache cũ sai rồi -> Xóa đi
    const key = `reviews:${validData.productId.toString()}`;
    await redisClient.del(key);
    console.log("🗑️ Đã xóa Cache Redis:", key);

    return { ...result, success: true, message: "Create comment successfully!" };
  } catch (error) { throw new Error(error.message); }
};

// 4. HÀM XÓA (CŨNG PHẢI XÓA CACHE)
const deleteCommentById = async (commentId, userId) => {
  try {
    // Lấy thông tin comment trước khi xóa để biết productId mà xóa cache
    const comment = await findOneById(commentId);
    
    const result = await getDB().collection(COMMENT_COLLECTION_NAME).deleteOne({ _id: new ObjectId(commentId) });
    if (result.deletedCount === 0) throw new Error("Comment not found");

    // Xóa Cache Redis tương ứng
    if (comment) {
        const key = `reviews:${comment.productId.toString()}`;
        await redisClient.del(key);
        console.log("🗑️ Đã xóa Cache Redis sau khi xóa comment");
    }

    return { success: true, message: "Deleted successfully!" };
  } catch (error) { throw new Error(error); }
};

export const commentModel = {
  findOneById,
  findAllCommentByProductId,
  deleteCommentById,
  createNew,
};
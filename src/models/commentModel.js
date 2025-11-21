import Joi from "joi";
import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";
// import { userModel } from "./userModel.js"; // Bỏ comment nếu cần dùng

// 1. SỬA TÊN COLLECTION CHO KHỚP
const COMMENT_COLLECTION_NAME = "reviews"; 
const ORDER_COLLECTION_NAME = "orders";

// 2. SCHEMA
const COMMENT_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required(),
  productId: Joi.string().required(),
  
  rating: Joi.number().min(1).max(5).default(5),
  comment: Joi.string().required(), 
  createdAt: Joi.date().timestamp("javascript").default(() => Date.now()),
  _destroy: Joi.boolean().default(false),
  
  // Fields phụ
  name: Joi.string().optional().allow(""),
  email: Joi.string().optional().allow(""),
  avatar: Joi.string().optional().allow(""),
  content: Joi.string().optional().allow("") 
});

const validateBeforeCreate = async (data) => {
  const validData = await COMMENT_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
    stripUnknown: true 
  });

  // Chuyển đổi ID sang ObjectId
  const dataReturn = {
    ...validData,
    productId: new ObjectId(validData.productId),
    userId: new ObjectId(validData.userId),
  };

  return dataReturn;
};

const findOneById = async (id) => {
  try {
    const result = await getDB()
      .collection(COMMENT_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findAllCommentByProductId = async (productId) => {
  try {
    const result = await getDB()
      .collection(COMMENT_COLLECTION_NAME)
      .find({ productId: new ObjectId(productId) })
      .sort({ createdAt: -1 }) 
      .toArray();
    return result;
  } catch (error) {
    throw new Error(`Error fetching comments: ${error.message}`);
  }
};

// --- HÀM TẠO REVIEW (ĐÃ FIX LOGIC) ---
const createNew = async (data) => {
  try {
    // validData lúc này đã chứa ObjectId cho userId và productId
    const validData = await validateBeforeCreate(data);

    // 1. CHECK MUA HÀNG
    // Lưu ý: Trong bảng Orders, productId trong mảng listProduct thường là String.
    // Nên ta phải dùng .toString() để so sánh.
    const hasPurchased = await getDB().collection(ORDER_COLLECTION_NAME).findOne({
      userId: validData.userId, // UserId trong order là ObjectId (theo orderModel cũ)
      "listProduct.productId": validData.productId.toString(), // Convert về String để khớp DB Orders
      status: "delivered", // Chỉ cho phép khi đã giao hàng
      _destroy: false
    });

    if (!hasPurchased) {
      throw new Error("Bạn phải mua và nhận hàng thành công mới được đánh giá!");
    }

    // 2. CHECK SPAM (Mỗi người 1 lần)
    const existingReview = await getDB().collection(COMMENT_COLLECTION_NAME).findOne({
      userId: validData.userId,
      productId: validData.productId,
      _destroy: false
    });

    if (existingReview) {
      throw new Error("Bạn đã đánh giá sản phẩm này rồi!");
    }

    // 3. LƯU VÀO DB
    // Lúc này dùng validData (đã là ObjectId) để lưu vào Reviews
    const result = await getDB().collection(COMMENT_COLLECTION_NAME).insertOne(validData);
    
    return { ...result, success: true, message: "Create comment successfully!" };
  } catch (error) {
    // Ném lỗi message string để Controller bắt được
    throw new Error(error.message);
  }
};

const deleteCommentById = async (commentId, userId) => {
  try {
    const result = await getDB()
      .collection(COMMENT_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(commentId) });

    if (result.deletedCount === 0) {
      throw new Error("Comment not found or already deleted");
    }

    return { success: true, message: "Comment deleted successfully!" };
  } catch (error) {
    throw new Error(error);
  }
};

export const commentModel = {
  findOneById,
  findAllCommentByProductId,
  deleteCommentById,
  createNew,
};
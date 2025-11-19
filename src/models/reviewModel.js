import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

const REVIEW_COLLECTION_NAME = "reviews";

const getAllReviews = async () => {
  try {
    const result = await getDB()
      .collection(REVIEW_COLLECTION_NAME)
      .aggregate([
        // 1. Lấy review chưa bị xóa
        { $match: { _destroy: false } },

        // 2. Kết nối với bảng USERS (Lấy tên người bình luận)
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },

        // 3. Kết nối với bảng PRODUCTS (Lấy tên sản phẩm)
        // Lưu ý: productId trong review thường lưu là ObjectId
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },

        // 4. Sắp xếp mới nhất lên đầu
        { $sort: { createdAt: -1 } }
      ])
      .toArray();

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// Hàm xóa mềm review
const deleteReview = async (id) => {
  try {
    const result = await getDB()
      .collection(REVIEW_COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { _destroy: true } }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
// Hàm duyệt đánh giá (Đổi status thành approved)
const approveReview = async (id) => {
  try {
    const result = await getDB()
      .collection(REVIEW_COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "approved" } }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
// Lấy chi tiết 1 review
const getReviewDetails = async (id) => {
  try {
    const result = await getDB()
      .collection(REVIEW_COLLECTION_NAME)
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        // Join User
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
        // Join Product
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } }
      ])
      .toArray();
    return result[0] || null;
  } catch (error) {
    throw new Error(error);
  }
};
export const reviewModel = {
  getAllReviews,
  deleteReview,
  approveReview,
  getReviewDetails,
};
import Joi from "joi";
import {getDB} from "../config/mongo.js";
import {ObjectId} from "mongodb";
import {parseStringToObjectId} from "../utils/parseStringToObjectId.js";

// regex validate object_id
const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;

const ORDER_COLLECTION_NAME = "orders";

// validate 1 lan nua truoc khi dua data vao CSDL
const orderItemSchema = Joi.object({
  productId: Joi.string().pattern(OBJECT_ID_RULE).required(),
  name: Joi.string().required(),
  size: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().required(),
  totalPrice: Joi.number().required(),
});

const ORDER_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.alternatives()
    .try(Joi.string().pattern(OBJECT_ID_RULE), Joi.string().trim())
    .required(),
  listProduct: Joi.array().items(orderItemSchema).min(1).required(),
  city: Joi.string().required().trim(),
  country: Joi.string().required().trim(),
  email: Joi.string().email().required().trim(),
  firstName: Joi.string().required().trim(),
  lastName: Joi.string().required().trim(),
  phoneNumber: Joi.string().required().trim(),
  paymentMethod: Joi.string().required().trim(),
  streetAddress: Joi.string().required().trim(),
  totalPriceOrder: Joi.number().required(),
  note: Joi.string().allow(""),
  coupon: Joi.string().allow(""),
  createAt: Joi.date()
    .timestamp("javascript")
    .default(() => Date.now()),
  _destroy: Joi.boolean().default(false),
  isPayment: Joi.boolean().default(false),
  status: Joi.string().default("pending"),
});

// thuc thi ham validation
const validateBeforeCreate = async (data) => {
  return await ORDER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const findOneById = async (id) => {
  try {
    const result = await getDB()
      .collection(ORDER_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};



const createNew = async (data) => {
  try {
    // kiem tra co pass qua dc validation hay khong
    const validData = await validateBeforeCreate(data);
    // chuyen huong toi Database
    const createdProduct = await getDB()
      .collection(ORDER_COLLECTION_NAME)
      .insertOne({
        ...validData,
        userId: parseStringToObjectId(validData.userId),
      });
    // tra data ve cho service
    return createdProduct;
  } catch (error) {
    throw new Error(error);
  }
};

const updateStatusByorderId = async (orderId, value) => {
  try {
    const result = await getDB()
      .collection(ORDER_COLLECTION_NAME)
      .updateOne(
        {
          _id: new ObjectId(orderId),
        },
        {
          $set: {status: value},
        }
      );
    return result.modifiedCount;
  } catch (error) {
    throw new Error(error);
  }
};

const updateIsPaymentByOrderId = async (orderId, value) => {
  try {
    const result = await getDB()
      .collection(ORDER_COLLECTION_NAME)
      .updateOne(
        {
          _id: new ObjectId(orderId),
        },
        {
          $set: {isPayment: value},
        }
      );
    return result.modifiedCount;
  } catch (error) {
    throw new Error(error);
  }
};

// Dán code này vào file models/orderModel.js
// THAY THẾ hàm getAllOrders cũ

const getAllOrders = async () => {
  try {
    const result = await getDB()
      .collection(ORDER_COLLECTION_NAME)
      .aggregate([
        // Chỉ lấy các đơn hàng không bị "xóa"
        { $match: { _destroy: false } },
        
        // Sắp xếp đơn hàng mới nhất lên đầu
        { $sort: { createAt: -1 } },
        
        // === Đây là phép "join" (kết hợp) với collection 'users' ===
        {
          $lookup: {
            from: 'users', // Tên collection của người dùng (bạn kiểm tra lại xem có đúng là 'users' không nhé)
            localField: 'userId', // Trường trong collection 'orders'
            foreignField: '_id', // Trường trong collection 'users'
            as: 'customerDetails' // Tên của mảng mới chứa thông tin user
          }
        },
        
        // $lookup trả về 1 mảng, chúng ta $unwind để biến nó thành 1 object
        {
          $unwind: {
            path: "$customerDetails",
            preserveNullAndEmptyArrays: true // Vẫn giữ đơn hàng ngay cả khi không tìm thấy user (ví dụ: user đã bị xóa)
          }
        }
      ])
      .toArray();
      
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const getAdminOrderDetails = async (id) => {
  try {
    const result = await getDB()
      .collection(ORDER_COLLECTION_NAME)
      .aggregate([
        // Bước 1: Tìm chính xác đơn hàng bằng ID
        { $match: { _id: new ObjectId(id) } },

        // Bước 2: "Join" (kết hợp) với collection 'users'
        {
          $lookup: {
            from: 'users', // Tên collection của người dùng
            localField: 'userId',
            foreignField: '_id',
            as: 'customerDetails'
          }
        },

        // Bước 3: Chuyển mảng 'customerDetails' thành 1 object
        {
          $unwind: {
            path: "$customerDetails",
            preserveNullAndEmptyArrays: true
          }
        }
      ])
      .toArray(); // Chuyển kết quả aggregate thành mảng

    // Aggregate luôn trả về 1 mảng, chúng ta chỉ cần phần tử đầu tiên
    return result[0] || null; 

  } catch (error) {
    throw new Error(error);
  }
};
// Dán hàm tổng quát này vào model
const updateOrder = async (id, dataToUpdate) => {
  try {
    // Lọc ra các trường không bao giờ được phép sửa
    delete dataToUpdate._id;
    delete dataToUpdate.userId;
    delete dataToUpdate.createAt;
    delete dataToUpdate.listProduct; // Không bao giờ cho sửa sản phẩm
    delete dataToUpdate.totalPriceOrder; // Không bao giờ cho sửa tổng tiền

    const result = await getDB()
      .collection(ORDER_COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: dataToUpdate }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
// Hàm xóa mềm (Chỉ ẩn đi)
const deleteOrder = async (id) => {
  try {
    const result = await getDB()
      .collection(ORDER_COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { _destroy: true } } // Đánh dấu là đã hủy
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
// Tìm tất cả đơn hàng của 1 user (dùng để hiển thị lịch sử mua hàng)
// Tìm tất cả đơn hàng của 1 user (Phiên bản sửa lỗi ObjectId)
const findByUserId = async (userId) => {
  try {
    const result = await getDB()
      .collection(ORDER_COLLECTION_NAME)
      .find({ 
        userId: new ObjectId(userId), // <-- QUAN TRỌNG: Phải dùng new ObjectId()
        _destroy: false 
      })
      .sort({ createAt: -1 }) 
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const orderModel = {
  findOneById,
  createNew,
  updateStatusByorderId,
  updateIsPaymentByOrderId,
  getAllOrders,
  getAdminOrderDetails,
  updateOrder,
  deleteOrder,
  findByUserId,
};

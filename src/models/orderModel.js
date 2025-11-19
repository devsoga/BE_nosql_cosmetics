import Joi from "joi";
import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;
const ORDER_COLLECTION_NAME = "orders";

// --- 1. LUẬT CHO SẢN PHẨM (Item) ---
const orderItemSchema = Joi.object({
  productId: Joi.string().pattern(OBJECT_ID_RULE).required(),
  name: Joi.string().required(), // Tên sản phẩm
  size: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().required(),
  totalPrice: Joi.number().required(),
});

// --- 2. LUẬT CHO ĐƠN HÀNG (Order) ---
const ORDER_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.alternatives().try(
    Joi.string().pattern(OBJECT_ID_RULE),
    Joi.string().trim()
  ).required(),

  listProduct: Joi.array().items(orderItemSchema).min(1).required(),
  
  // === QUAN TRỌNG: Dùng 'name' thay cho firstName/lastName ===
  name: Joi.string().trim().required(), // Tên người nhận hàng
  
  email: Joi.string().email().trim().default(""),
  phoneNumber: Joi.string().trim().default(""),
  
  streetAddress: Joi.string().required().trim(),
  city: Joi.string().required().trim(),
  country: Joi.string().required().trim(),
  
  totalPriceOrder: Joi.number().required(),
  note: Joi.string().allow("").default(""),
  coupon: Joi.string().allow("").default(""),
  paymentMethod: Joi.string().required().trim(),
  
  status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').default('pending'),
  isPayment: Joi.boolean().default(false),
  createAt: Joi.date().timestamp("javascript").default(() => Date.now()),
  _destroy: Joi.boolean().default(false),
});

// --- 3. CÁC HÀM XỬ LÝ ---

const validateBeforeCreate = async (data) => {
  return await ORDER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false });
};

const findOneById = async (id) => {
  try {
    const result = await getDB().collection(ORDER_COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const createNew = async (data) => {
  try {
    // Xóa các trường thừa nếu lỡ có gửi lên để tránh lỗi
    delete data.firstName;
    delete data.lastName;

    const validData = await validateBeforeCreate(data);
    
    // Chuyển userId sang ObjectId nếu hợp lệ
    const userIdToSave = ObjectId.isValid(validData.userId) ? new ObjectId(validData.userId) : validData.userId;
    
    const createdOrder = await getDB().collection(ORDER_COLLECTION_NAME).insertOne({
      ...validData,
      userId: userIdToSave
    });
    return createdOrder;
  } catch (error) {
    throw new Error(error);
  }
};

const getAllOrders = async () => {
  try {
    const result = await getDB().collection(ORDER_COLLECTION_NAME).aggregate([
        { $match: { _destroy: false } },
        { $sort: { createAt: -1 } },
        {
          $lookup: {
            from: 'users',
            let: { userId: "$userId" }, 
            pipeline: [
              { $match: { $expr: { $or: [
                       { $eq: [ "$_id", "$$userId" ] },
                       { $eq: [ { $toString: "$_id" }, "$$userId" ] }
                    ]}
                 }
              }
            ],
            as: 'customerDetails'
          }
        },
        { $unwind: { path: "$customerDetails", preserveNullAndEmptyArrays: true } }
      ]).toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getAdminOrderDetails = async (id) => {
  try {
    const result = await getDB().collection(ORDER_COLLECTION_NAME).aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: 'users',
            let: { userId: "$userId" },
            pipeline: [
              { $match: { $expr: { $or: [
                       { $eq: [ "$_id", "$$userId" ] },
                       { $eq: [ { $toString: "$_id" }, "$$userId" ] }
                    ]}
                 }
              }
            ],
            as: 'customerDetails'
          }
        },
        { $unwind: { path: "$customerDetails", preserveNullAndEmptyArrays: true } }
      ]).toArray();
    return result[0] || null; 
  } catch (error) {
    throw new Error(error);
  }
};

const findByUserId = async (userId) => {
  try {
    const result = await getDB()
      .collection(ORDER_COLLECTION_NAME)
      .find({ 
        $or: [
            { userId: userId.toString() },      
            { userId: new ObjectId(userId) }    
        ],
        _destroy: false 
      })
      .sort({ createAt: -1 }) 
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findByEmail = async (email) => {
  try {
    const result = await getDB()
      .collection(ORDER_COLLECTION_NAME)
      .find({ 
        email: email, 
        _destroy: false 
      })
      .sort({ createAt: -1 })
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const updateOrder = async (id, dataToUpdate) => {
  try {
    delete dataToUpdate._id;
    delete dataToUpdate.userId;
    delete dataToUpdate.createAt;
    delete dataToUpdate.listProduct;
    delete dataToUpdate.totalPriceOrder;

    const result = await getDB().collection(ORDER_COLLECTION_NAME).updateOne(
        { _id: new ObjectId(id) },
        { $set: dataToUpdate }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteOrder = async (id) => {
  try {
    const result = await getDB().collection(ORDER_COLLECTION_NAME).updateOne(
        { _id: new ObjectId(id) },
        { $set: { _destroy: true } }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

// Các hàm legacy để tránh lỗi nếu code cũ gọi
const updateStatusByorderId = async (orderId, value) => {
  return await updateOrder(orderId, { status: value });
};
const updateIsPaymentByOrderId = async (orderId, value) => {
  return await updateOrder(orderId, { isPayment: value });
};

export const orderModel = {
  findOneById,
  createNew,
  getAllOrders,
  getAdminOrderDetails,
  findByUserId,
  findByEmail,
  updateOrder,
  deleteOrder,
  updateStatusByorderId,
  updateIsPaymentByOrderId,
};
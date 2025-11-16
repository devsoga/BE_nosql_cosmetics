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

const findOneByUserId = async (userId) => {
  try {
    const result = await getDB()
      .collection(ORDER_COLLECTION_NAME)
      .find({userId: new ObjectId(userId)})
      .toArray();

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

const getAllOrders = async () => {
  try {
    const result = await getDB()
      .collection(ORDER_COLLECTION_NAME)
      .find({_destroy: false})
      .sort({createAt: -1})
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
  findOneByUserId,
  getAllOrders,
};

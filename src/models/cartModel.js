import Joi from "joi";
import {getDB} from "../config/mongo.js";
import {ObjectId} from "mongodb";
import {parseStringToObjectId} from "../utils/parseStringToObjectId.js";

// regex validate object_id
const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;

const CART_COLLECTION_NAME = "carts";

// validate 1 lan nua truoc khi dua data vao CSDL
const cartItemSchema = Joi.object({
  productId: Joi.string().pattern(OBJECT_ID_RULE).required(),
  name: Joi.string().required(),
  size: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  image: Joi.string().required(),
  price: Joi.number().required(),
});

const CART_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.alternatives()
    .try(Joi.string().pattern(OBJECT_ID_RULE), Joi.string().trim())
    .required(),
  item: cartItemSchema.required(),
  createAt: Joi.date()
    .timestamp("javascript")
    .default(() => Date.now()),
});

// thuc thi ham validation
const validateBeforeCreate = async (data) => {
  return await CART_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const createNew = async (data) => {
  try {
    // kiem tra co pass qua dc validation hay khong
    const validData = await validateBeforeCreate(data);
    const objectIdUser = parseStringToObjectId(validData.userId);
    const objectIdProduct = parseStringToObjectId(validData.item.productId);

    const dataFinal = {
      ...validData,
      userId: objectIdUser,
      item: {
        ...validData.item,
        productId: objectIdProduct,
      },
    };

    // chuyen huong toi Database
    const createdCart = await getDB()
      .collection(CART_COLLECTION_NAME)
      .insertOne(dataFinal);

    // tra data ve cho service
    return createdCart;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  try {
    const result = await getDB()
      .collection(CART_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getAllCart = async ({userId}) => {
  try {
    const result = await getDB()
      .collection(CART_COLLECTION_NAME)
      .find({userId: new ObjectId(userId)})
      .toArray();

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getAllCartByProductId = async ({productId}) => {
  try {
    const result = await getDB()
      .collection(CART_COLLECTION_NAME)
      .find({
        "item.productId": new ObjectId(productId),
      })
      .toArray();

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getCartIdByProductIdAndSize = async ({productId, size}) => {
  try {
    const result = await getDB()
      .collection(CART_COLLECTION_NAME)
      .find({
        "item.productId": new ObjectId(productId),
        "item.size": size,
      })
      .toArray();
    return result[0]?._id || null;
  } catch (error) {
    throw new Error(error);
  }
};

const getQuantityByCartId = async (cartId) => {
  try {
    const result = await getDB().collection(CART_COLLECTION_NAME).findOne({
      _id: cartId,
    });

    const {item} = result;

    return item.quantity;
  } catch (error) {
    throw new Error(error);
  }
};

const updateQuantity = async (reqbody) => {
  const {cartId, quantity} = reqbody;
  try {
    const result = await getDB()
      .collection(CART_COLLECTION_NAME)
      .updateOne(
        {
          _id: new ObjectId(cartId),
        },
        {
          $set: {"item.quantity": quantity},
        }
      );

    return result.modifiedCount;
  } catch (error) {
    throw new Error(error);
  }
};

const updateSize = async ({cartId, size}) => {
  try {
    const result = await getDB()
      .collection(CART_COLLECTION_NAME)
      .updateOne(
        {
          _id: new ObjectId(cartId),
        },
        {
          $set: {"item.size": size},
        }
      );
    return result.modifiedCount;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteCart = async ({cartId}) => {
  try {
    const result = await getDB()
      .collection(CART_COLLECTION_NAME)
      .deleteOne({
        _id: new ObjectId(cartId),
      });

    // Returns the number of deleted documents
    return result.deletedCount;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteAllCart = async () => {
  try {
    const result = await getDB()
      .collection(CART_COLLECTION_NAME)
      .deleteMany({}); // Empty filter = delete all docs

    return result.deletedCount; // Number of deleted documents
  } catch (error) {
    throw new Error(error);
  }
};

export const cartModel = {
  findOneById,
  getAllCart,
  createNew,
  getAllCartByProductId,
  getCartIdByProductIdAndSize,
  getQuantityByCartId,
  updateQuantity,
  updateSize,
  deleteCart,
  deleteAllCart,
};

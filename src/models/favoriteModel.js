import Joi from "joi";
import {getDB} from "../config/mongo.js";
import {ObjectId} from "mongodb";
import {parseStringToObjectId} from "../utils/parseStringToObjectId.js";
// regex validate object_id
const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;

const FAVORITE_COLLECTION_NAME = "favorites";

// validate 1 lan nua truoc khi dua data vao CSDL
const cartItemSchema = Joi.object({
  productId: Joi.string().pattern(OBJECT_ID_RULE).required(),
  name: Joi.string().required(),
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
      .collection(FAVORITE_COLLECTION_NAME)
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
      .collection(FAVORITE_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneByProductId = async (productId) => {
  try {
    const result = await getDB()
      .collection(FAVORITE_COLLECTION_NAME)
      .findOne({
        "item.productId": new ObjectId(productId),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getAllFavorite = async ({userId}) => {
  try {
    const result = await getDB()
      .collection(FAVORITE_COLLECTION_NAME)
      .find({userId: new ObjectId(userId)})
      .toArray();

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteFavorite = async ({favoriteId}) => {
  try {
    const result = await getDB()
      .collection(FAVORITE_COLLECTION_NAME)
      .deleteOne({
        _id: new ObjectId(favoriteId),
      });

    // Returns the number of deleted documents
    return result.deletedCount;
  } catch (error) {
    throw new Error(error);
  }
};

const clearUserWishlist = async (userId) => {
  try {
    const result = await getDB()
      .collection(FAVORITE_COLLECTION_NAME)
      .deleteMany({
        userId: new ObjectId(userId),
      });

    return result.deletedCount;
  } catch (error) {
    throw new Error(error);
  }
};

export const favoriteModel = {
  createNew,
  findOneById,
  getAllFavorite,
  deleteFavorite,
  findOneByProductId,
  clearUserWishlist,
};

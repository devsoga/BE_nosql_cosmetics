import Joi from "joi";
import {getDB} from "../config/mongo.js";
import {ObjectId} from "mongodb";

// regex validate object_id
//const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;

const USER_COLLECTION_NAME = "users";

// validate 1 lan nua truoc khi dua data vao CSDL
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().email().required().trim().strict(),
  password: Joi.string().min(6).required().trim().strict(),
  username: Joi.string().required().trim().strict(),
  createAt: Joi.date()
    .timestamp("javascript")
    .default(() => Date.now()),
  _destroy: Joi.boolean().default(false),
});

// thuc thi ham validation
const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};
const existingUser = async (email) => {
  try {
    const result = await getDB().collection(USER_COLLECTION_NAME).findOne({
      email: email,
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  try {
    const result = await getDB()
      .collection(USER_COLLECTION_NAME)
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
    // kiem tra ton tai email hay chua
    const exist = await existingUser(data.email);
    if (exist) {
      return null;
    }
    // chuyen huong toi Database
    const createdProduct = await getDB()
      .collection(USER_COLLECTION_NAME)
      .insertOne(validData);
    // tra data ve cho service
    return createdProduct;
  } catch (error) {
    throw new Error(error);
  }
};

const login = async (data) => {
  try {
    const result = await getDB().collection(USER_COLLECTION_NAME).findOne({
      email: data.email,
      password: data.password,
    });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findByEmail = async (email) => {
  try {
    const result = await getDB().collection(USER_COLLECTION_NAME).findOne({
      email: email,
      _destroy: false,
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getAllUsers = async () => {
  try {
    const result = await getDB()
      .collection(USER_COLLECTION_NAME)
      .find({_destroy: false})
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const userModel = {
  findOneById,
  login,
  createNew,
  findByEmail,
  getAllUsers,
};

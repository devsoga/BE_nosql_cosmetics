import Joi from "joi";
import {getDB} from "../config/mongo.js";
import {ObjectId} from "mongodb";
import {parseStringToObjectId} from "../utils/parseStringToObjectId.js";
import {parseObjectIdToString} from "../utils/parseObjectIdToString.js";
import {userModel} from "./userModel.js";

// regex validate object_id
const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;

const COMMENT_COLLECTION_NAME = "comments";

// validate 1 lan nua truoc khi dua data vao CSDL
const COMMENT_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().pattern(OBJECT_ID_RULE).required(),
  productId: Joi.string().pattern(OBJECT_ID_RULE).required(),
  comment: Joi.string().required().trim().strict(),
  createAt: Joi.date()
    .timestamp("javascript")
    .default(() => Date.now()),
});

// thuc thi ham validation
const validateBeforeCreate = async (data) => {
  const validData = await COMMENT_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });

  const userInfo = await userModel.findOneById(data.userId);

  const dataReturn = {
    ...validData,
    username: userInfo.username,
    productId: parseStringToObjectId(data.productId),
    userId: parseStringToObjectId(data.userId),
  };

  return dataReturn;
};

const findOneById = async (id) => {
  try {
    const result = await getDB()
      .collection(COMMENT_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findAllCommentByProductId = async (productId) => {
  try {
    const result = await getDB()
      .collection(COMMENT_COLLECTION_NAME)
      .find({productId: new ObjectId(productId)})
      .toArray();

    return result;
  } catch (error) {
    throw new Error(`Error fetching comments: ${error.message}`);
  }
};

const createNew = async (data) => {
  try {
    // kiem tra co pass qua dc validation hay khong
    const validData = await validateBeforeCreate(data);
    // chuyen huong toi Database

    const result = await getDB()
      .collection(COMMENT_COLLECTION_NAME)
      .insertOne(validData);
    // tra data ve cho service
    return {...result, success: true, message: "Create comment successfully!"};
  } catch (error) {
    throw new Error(error);
  }
};

const isOwnComment = async (commentId, userId) => {
  const result = await findOneById(commentId);
  return userId === parseObjectIdToString(result.userId);
};

const deleteCommentById = async (commentId, userId) => {
  try {
    const isOwn = await isOwnComment(commentId, userId);

    if (!isOwn) {
      return {success: false, message: "You don't have permission!"};
    }

    const result = await getDB()
      .collection(COMMENT_COLLECTION_NAME)
      .deleteOne({_id: new ObjectId(commentId)});

    // Kiểm tra có xóa được không
    if (result.deletedCount === 0) {
      throw new Error("Comment not found or already deleted");
    }

    return {success: true, message: "Comment deleted successfully!"};
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

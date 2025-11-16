import {commentModel} from "../models/commentModel.js";

const createNew = async (reqBody) => {
  try {
    // chuyen huong toi model
    const result = await commentModel.createNew(reqBody);

    const getComment = await commentModel.findOneById(result.insertedId);
    // tra data ve controller
    return getComment;
  } catch (error) {
    throw error;
  }
};
const findAllCommentByProductId = async (productId) => {
  try {
    return await commentModel.findAllCommentByProductId(productId);
  } catch (error) {
    throw error;
  }
};

const deleteCommentById = async (reqBody) => {
  const {commentId, userId} = reqBody;

  try {
    return await commentModel.deleteCommentById(commentId, userId);
  } catch (error) {
    throw error;
  }
};

export const commentService = {
  createNew,
  findAllCommentByProductId,
  deleteCommentById,
};

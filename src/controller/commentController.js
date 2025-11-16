import {StatusCodes} from "http-status-codes";
import {commentService} from "../services/commentService.js";

const createNew = async (req, res, next) => {
  try {
    // chuyen huong sang service
    const result = await commentService.createNew(req.body);

    // tra data ve client
    res
      .status(StatusCodes.CREATED)
      .json({...result, message: "Create successfully!"});
  } catch (error) {
    next(error);
  }
};
const findAllCommentByProductId = async (req, res, next) => {
  const {id} = req.params;
  try {
    // chuyen huong sang service
    const result = await commentService.findAllCommentByProductId(id);

    // tra data ve client
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteCommentById = async (req, res, next) => {
  try {
    // chuyen huong sang service
    const result = await commentService.deleteCommentById(req.body);

    // tra data ve client
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getReviewsPaginated = async (req, res, next) => {
  const {id} = req.params;
  const {page = 1, limit = 5} = req.query;
  try {
    const result = await commentService.getReviewsPaginated(
      id,
      parseInt(page),
      parseInt(limit)
    );
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  const {id} = req.params;
  try {
    const result = await commentService.updateReview(id, req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getReviewStats = async (req, res, next) => {
  const {productId} = req.params;
  try {
    const stats = await commentService.getReviewStats(productId);
    res.status(StatusCodes.OK).json(stats);
  } catch (error) {
    next(error);
  }
};

export const commentController = {
  createNew,
  findAllCommentByProductId,
  deleteCommentById,
  getReviewsPaginated,
  updateReview,
  getReviewStats,
};

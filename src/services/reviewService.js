import { reviewModel } from "../models/reviewModel.js";

const getAllReviews = async () => {
  try {
    const result = await reviewModel.getAllReviews();
    return result;
  } catch (error) {
    throw error;
  }
};

const deleteReviewById = async (id) => {
  try {
    const result = await reviewModel.deleteReview(id);
    return result;
  } catch (error) {
    throw error;
  }
};
const approveReviewById = async (id) => {
  try {
    const result = await reviewModel.approveReview(id);
    return result;
  } catch (error) {
    throw error;
  }
};
const getReviewById = async (id) => {
  try {
    const result = await reviewModel.getReviewDetails(id);
    return result;
  } catch (error) {
    throw error;
  }
};
export const reviewService = {
  getAllReviews,
  deleteReviewById,
  approveReviewById,
    getReviewById,
};
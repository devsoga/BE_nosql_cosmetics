import {StatusCodes} from "http-status-codes";
import {favoriteService} from "../services/favoriteService.js";

const createNew = async (req, res, next) => {
  try {
    // chuyen huong sang service

    const createFavorite = await favoriteService.createNew(req.body);
    // tra data ve client
    res
      .status(StatusCodes.CREATED)
      .json({...createFavorite, message: "Added to favorites!"});
  } catch (error) {
    next(error);
  }
};

const getAllFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.getAllFavorite(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
const getById = async (req, res, next) => {
  try {
    const result = await favoriteService.getById(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};
const findOneByProductId = async (req, res, next) => {
  try {
    const result = await favoriteService.findOneByProductId(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.deleteFavorite(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

// New methods for wishlist functionality
const getUserWishlist = async (req, res, next) => {
  const {userId} = req.params;
  try {
    const result = await favoriteService.getAllFavorite({userId});
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const checkProductInWishlist = async (req, res, next) => {
  const {userId, productId} = req.params;
  try {
    const result = await favoriteService.findOneByProductId({productId});
    const isInWishlist = result && result.userId.toString() === userId;
    res.status(StatusCodes.OK).json({isInWishlist, item: result});
  } catch (error) {
    next(error);
  }
};

const toggleWishlist = async (req, res, next) => {
  try {
    const {userId, item} = req.body;
    const existing = await favoriteService.findOneByProductId({
      productId: item.productId,
    });

    if (existing && existing.userId.toString() === userId) {
      // Remove from wishlist
      const result = await favoriteService.deleteFavorite({
        favoriteId: existing._id,
      });
      res
        .status(StatusCodes.OK)
        .json({action: "removed", result, message: "Removed from wishlist"});
    } else {
      // Add to wishlist
      const result = await favoriteService.createNew({userId, item});
      res
        .status(StatusCodes.OK)
        .json({action: "added", result, message: "Added to wishlist"});
    }
  } catch (error) {
    next(error);
  }
};

const clearUserWishlist = async (req, res, next) => {
  const {userId} = req.params;
  try {
    const result = await favoriteService.clearUserWishlist(userId);
    res
      .status(StatusCodes.OK)
      .json({message: "Wishlist cleared", deletedCount: result});
  } catch (error) {
    next(error);
  }
};

const deleteAllFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.deleteAllCart();
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const favoriteController = {
  createNew,
  getAllFavorite,
  deleteFavorite,
  deleteAllFavorite,
  getById,
  findOneByProductId,
  getUserWishlist,
  checkProductInWishlist,
  toggleWishlist,
  clearUserWishlist,
};

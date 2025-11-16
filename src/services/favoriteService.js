import {cartModel} from "../models/cartModel.js";
import {favoriteModel} from "../models/favoriteModel.js";

const createNew = async (reqBody) => {
  try {
    // chuyen huong toi model
    const result = await favoriteModel.createNew(reqBody);
    const getItemInserted = await favoriteModel.findOneById(result.insertedId);

    return getItemInserted;
  } catch (error) {
    throw error;
  }
};

const getById = async (id) => {
  const {favoriteId} = id;
  try {
    const result = await favoriteModel.findOneById(favoriteId);

    return result;
  } catch (error) {
    throw error;
  }
};

const findOneByProductId = async (id) => {
  const {productId} = id;

  try {
    const result = await favoriteModel.findOneByProductId(productId);

    return result;
  } catch (error) {
    throw error;
  }
};

const getAllFavorite = async (userId) => {
  try {
    const result = await favoriteModel.getAllFavorite(userId);

    return result;
  } catch (error) {
    throw error;
  }
};

const deleteFavorite = async (id) => {
  try {
    const result = await favoriteModel.deleteFavorite(id);
    return result;
  } catch (error) {
    throw error;
  }
};

const deleteAllCart = async () => {
  // console.log(cartId);
  try {
    const result = await cartModel.deleteAllCart();
    return result;
  } catch (error) {
    throw error;
  }
};

const clearUserWishlist = async (userId) => {
  try {
    const result = await favoriteModel.clearUserWishlist(userId);
    return result;
  } catch (error) {
    throw error;
  }
};

export const favoriteService = {
  createNew,
  getAllFavorite,
  deleteFavorite,
  getById,
  findOneByProductId,
  clearUserWishlist,
};

import {StatusCodes} from "http-status-codes";
import {cartService} from "../services/cartService.js";

const createNew = async (req, res, next) => {
  try {
    // chuyen huong sang service
    const createCart = await cartService.createNew(req.body);
    // tra data ve client
    res
      .status(StatusCodes.CREATED)
      .json({...createCart, message: "Add to cart successfully!"});
  } catch (error) {
    next(error);
  }
};

const getAllCart = async (req, res, next) => {
  try {
    const result = await cartService.getAllCart(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getAllCartByProductId = async (req, res, next) => {
  try {
    const result = await cartService.getAllCartByProductId(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getCartIdByProductIdAndSize = async (req, res, next) => {
  try {
    const result = await cartService.getCartIdByProductIdAndSize(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const updateQuantity = async (req, res, next) => {
  try {
    const result = await cartService.updateQuantity(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const updateSize = async (req, res, next) => {
  try {
    const result = await cartService.updateSize(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const result = await cartService.deleteCart(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteAllCart = async (req, res, next) => {
  try {
    const result = await cartService.deleteAllCart();
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const cartController = {
  createNew,
  getAllCart,
  getAllCartByProductId,
  getCartIdByProductIdAndSize,
  updateQuantity,
  updateSize,
  deleteCart,
  deleteAllCart,
};

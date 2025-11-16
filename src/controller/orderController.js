import {StatusCodes} from "http-status-codes";
import {orderService} from "../services/orderService.js";

const createNew = async (req, res, next) => {
  try {
    // chuyen huong sang service
    const result = await orderService.createNew(req.body);

    // tra data ve client
    res
      .status(StatusCodes.CREATED)
      .json({...result, message: "Order successfully!"});
  } catch (error) {
    next(error);
  }
};
const getById = async (req, res, next) => {
  try {
    // chuyen huong sang service
    const result = await orderService.getById(req.body);

    // tra data ve client
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

const getOrderByUserId = async (req, res, next) => {
  try {
    // chuyen huong sang service
    const result = await orderService.getOrderByUserId(req.body);

    // tra data ve client
    res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};
const updateStatusById = async (req, res, next) => {
  try {
    // chuyen huong sang service
    const result = await orderService.updateStatusById(req.body);

    // tra data ve client
    res
      .status(StatusCodes.CREATED)
      .json(
        result == 1
          ? {data: result, message: "Update status successfull!"}
          : {data: result, message: "Update status unsuccessfull!"}
      );
  } catch (error) {
    next(error);
  }
};

export const orderController = {
  createNew,
  getById,
  updateStatusById,
  getOrderByUserId,
};

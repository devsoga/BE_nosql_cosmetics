import {orderModel} from "../models/orderModel.js";
import {cartModel} from "../models/cartModel.js";
const createNew = async (reqBody) => {
  try {
    // chuyen huong toi model
    const result = await orderModel.createNew(reqBody);
    if (!result) return null;

    const getNewOrder = await orderModel.findOneById(result.insertedId);

    // clear list cart
    await cartModel.deleteAllCart();
    // tra data ve controller
    return getNewOrder;
  } catch (error) {
    throw error;
  }
};

const getById = async ({id}) => {
  try {
    // chuyen huong toi model
    const result = await orderModel.findOneById(id);
    return result;
  } catch (error) {
    throw error;
  }
};

const getOrderByUserId = async ({userId}) => {
  try {
    // chuyen huong toi model
    const result = await orderModel.findOneByUserId(userId);
    return result;
  } catch (error) {
    throw error;
  }
};

const updateStatusById = async (reqBody) => {
  const {id, value} = reqBody;
  try {
    // chuyen huong toi model
    const result = await orderModel.updateStatusByorderId(id, value);
    return result;
  } catch (error) {
    throw error;
  }
};

const getAllOrders = async () => {
  try {
    const result = await orderModel.getAllOrders();
    return result;
  } catch (error) {
    throw error;
  }
};

export const orderService = {
  createNew,
  getById,
  updateStatusById,
  getOrderByUserId,
  getAllOrders,
};

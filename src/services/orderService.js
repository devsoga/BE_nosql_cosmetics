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
const getAdminOrderById = async (id) => {
  try {
    // Gọi hàm xịn ở Model
    const result = await orderModel.getAdminOrderDetails(id);
    return result;
  } catch (error) {
    throw error;
  }
};
const updateOrderById = async (id, data) => {
  try {
    const result = await orderModel.updateOrder(id, data);
    return result;
  } catch (error) {
    throw error;
  }
};
// (dùng cho admin tạo đơn)
const createAdminOrder = async (orderData) => {
  try {
    // Chỉ gọi model để tạo, không đụng đến giỏ hàng
    const newOrder = await orderModel.createNew(orderData);
    return newOrder;
  } catch (error) {
    throw error;
  }
};
// Hàm xóa đơn hàng (gọi xuống Model)
const deleteOrderById = async (id) => {
  try {
    const result = await orderModel.deleteOrder(id);
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
  getAdminOrderById,
  updateOrderById,
  createAdminOrder,
  deleteOrderById,
};

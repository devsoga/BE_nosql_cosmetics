import {cartModel} from "../models/cartModel.js";

const createNew = async (reqBody) => {
  const {item} = reqBody;

  let getItemCreated = {};
  try {
    // chuyen huong toi model
    const cartId = await cartModel.getCartIdByProductIdAndSize(item);
    if (cartId) {
      const quantityCurrent = await cartModel.getQuantityByCartId(cartId);

      await cartModel.updateQuantity({
        cartId,
        quantity: quantityCurrent + item.quantity,
      });
      getItemCreated = await cartModel.findOneById(cartId);
    } else {
      const createdCart = await cartModel.createNew(reqBody);
      getItemCreated = await cartModel.findOneById(createdCart.insertedId);
    }

    return getItemCreated;
  } catch (error) {
    throw error;
  }
};

const getAllCart = async (userId) => {
  try {
    const result = await cartModel.getAllCart(userId);
    return result;
  } catch (error) {
    throw error;
  }
};

const getAllCartByProductId = async (productId) => {
  try {
    const result = await cartModel.getAllCartByProductId(productId);
    return result;
  } catch (error) {
    throw error;
  }
};

const getCartIdByProductIdAndSize = async (productId) => {
  try {
    const result = await cartModel.getCartIdByProductIdAndSize(productId);
    return result;
  } catch (error) {
    throw error;
  }
};
const updateQuantity = async (reqBody) => {
  try {
    const result = await cartModel.updateQuantity(reqBody);
    return result;
  } catch (error) {
    throw error;
  }
};
const updateSize = async (reqBody) => {
  try {
    const result = await cartModel.updateSize(reqBody);
    return result;
  } catch (error) {
    throw error;
  }
};

const deleteCart = async (cartId) => {
  // console.log(cartId);
  try {
    const result = await cartModel.deleteCart(cartId);
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

export const cartService = {
  createNew,
  getAllCart,
  getAllCartByProductId,
  getCartIdByProductIdAndSize,
  updateQuantity,
  updateSize,
  deleteCart,
  deleteAllCart,
};

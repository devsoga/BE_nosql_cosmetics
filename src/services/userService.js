import {userModel} from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { orderModel } from "../models/orderModel.js";

const createNew = async (reqBody) => {
  try {
    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(reqBody.password, salt);

    const newUser = {
      ...reqBody,
      password: hashedPassword,
    };

    // chuyen huong toi model
    const createUser = await userModel.createNew(newUser);
    if (!createUser) return null;

    const getNewUser = await userModel.findOneById(createUser.insertedId);
    // tra data ve controller (without password)
    const {password, ...userWithoutPassword} = getNewUser;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

const login = async (reqBody) => {
  try {
    const userAccount = await userModel.login(reqBody);
    // lat tat ca pro
    return userAccount;
  } catch (error) {
    throw error;
  }
};

const findByEmail = async (email) => {
  try {
    const user = await userModel.findByEmail(email);
    return user;
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const users = await userModel.getAllUsers();
    return users;
  } catch (error) {
    throw error;
  }
};
const getOneById = async (id) => {
  try {
    // Hàm này gọi thẳng xuống model
    // (Model của bạn đã có hàm findOneById, vì hàm createNew đang dùng nó)
    const user = await userModel.findOneById(id);
    return user;
  } catch (error) {
    throw error;
  }
};
const getUserDetails = async (id) => {
  try {
    // 1. Lấy thông tin user
    const user = await userModel.findOneById(id);
    if (!user) return null;

    // 2. Lấy lịch sử đơn hàng của user đó
    const orders = await orderModel.findByEmail(user.email);
    // 3. Trả về cả hai
    return { user, orders };
  } catch (error) {
    throw error;
  }
};
const updateUserById = async (id, data) => {
  try {
    const result = await userModel.updateUser(id, data);
    return result;
  } catch (error) {
    throw error;
  }
};
const deleteUserById = async (id) => {
  try {
    const result = await userModel.deleteUser(id);
    return result;
  } catch (error) {
    throw error;
  }
};

export const userService = {
  createNew,
  login,
  findByEmail,
  getAllUsers,
  getOneById,
  getUserDetails,
  updateUserById,
  deleteUserById,
};

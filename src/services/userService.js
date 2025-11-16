import {userModel} from "../models/userModel.js";
import bcrypt from "bcryptjs";

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

export const userService = {
  createNew,
  login,
  findByEmail,
  getAllUsers,
};

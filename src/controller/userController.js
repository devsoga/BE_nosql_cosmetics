import {StatusCodes} from "http-status-codes";
import {userService} from "../services/userService.js";
import bcrypt from "bcryptjs";

const createNew = async (req, res, next) => {
  try {
    // chuyen huong sang service
    const createUser = await userService.createNew(req.body);

    // tra data ve client
    if (createUser) {
      res
        .status(StatusCodes.CREATED)
        .json({...createUser, message: "Create successfully!"});
    } else {
      res.status(StatusCodes.CONFLICT).json({message: "Email already exist!"});
    }
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const {email, password} = req.body;
    const userAccount = await userService.findByEmail(email);

    if (userAccount && userAccount._destroy == false) {
      const isPasswordValid = await bcrypt.compare(
        password,
        userAccount.password
      );

      if (isPasswordValid) {
        res.status(StatusCodes.OK).json({
          _id: userAccount._id,
          username: userAccount.username,
          email: userAccount.email,
          createAt: userAccount.createAt,
          message: "Login successfully!",
        });
      } else {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({message: "Invalid email or password!"});
      }
    } else {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({message: "Your Account is undefined or expired!"});
    }
  } catch (error) {
    next(error);
  }
};

export const userController = {
  createNew,
  login,
};

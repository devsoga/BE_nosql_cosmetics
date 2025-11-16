import {StatusCodes} from "http-status-codes";
import {sepayService} from "../services/sepayService.js";

const checkSepay = async (req, res, next) => {
  console.log(req.body);
  try {
    // chuyen huong sang service
    await sepayService.checkSepay(req.body);
    // tra data ve client

    res.sendStatus(StatusCodes.OK);
  } catch (error) {
    next(error);
  }
};

export const sepayController = {
  checkSepay,
};

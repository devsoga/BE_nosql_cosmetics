import {StatusCodes} from "http-status-codes";
import {historyTransferService} from "../services/historyTransferService.js";

const findOneByOrderId = async (req, res, next) => {
  try {
    // chuyen huong sang service
    const result = await historyTransferService.findOneByOrderId(req.body);
    // tra data ve client

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const historyTransferController = {
  findOneByOrderId,
};

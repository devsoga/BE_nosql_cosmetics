import {getDB} from "../config/mongo.js";
import {ObjectId} from "mongodb";

// regex validate object_id
//const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;

const HISTORY_COLLECTION_NAME = "historyTransfers";

const findOneByOrderId = async (orderId) => {
  try {
    const result = await getDB()
      .collection(HISTORY_COLLECTION_NAME)
      .findOne({
        orderId: new ObjectId(orderId),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const createNew = async (data) => {
  try {
    // chuyen huong toi Database
    const result = await getDB()
      .collection(HISTORY_COLLECTION_NAME)
      .insertOne(data);
    // tra data ve cho service
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const historyTransfersModel = {
  findOneByOrderId,
  createNew,
};

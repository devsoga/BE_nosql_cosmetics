import {ObjectId} from "mongodb";

export const parseStringToObjectId = (id) => {
  return new ObjectId(id);
};

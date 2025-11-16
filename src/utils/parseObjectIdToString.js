import {ObjectId} from "mongodb";

/**
 * Chuyển ObjectId trong document hoặc mảng document sang string
 */
export const parseObjectIdToString = (data) => {
  if (!data) return data;

  // Nếu là ObjectId => convert sang string
  if (data instanceof ObjectId) {
    return data.toHexString();
  }

  // Nếu là mảng => duyệt từng phần tử
  if (Array.isArray(data)) {
    return data.map((item) => parseObjectIdToString(item));
  }

  // Nếu là object => duyệt từng key
  if (typeof data === "object") {
    const newObj = {};
    for (const key in data) {
      newObj[key] = parseObjectIdToString(data[key]);
    }
    return newObj;
  }

  // Các kiểu dữ liệu khác giữ nguyên
  return data;
};

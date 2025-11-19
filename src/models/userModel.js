import Joi from "joi";
import {getDB} from "../config/mongo.js";
import {ObjectId} from "mongodb";

// regex validate object_id
//const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;

const USER_COLLECTION_NAME = "users";

// validate 1 lan nua truoc khi dua data vao CSDL
// const USER_COLLECTION_SCHEMA = Joi.object({
//   email: Joi.string().email().required().trim().strict(),
//   password: Joi.string().min(6).required().trim().strict(),
//   username: Joi.string().required().trim().strict(),
//   createAt: Joi.date()
//     .timestamp("javascript")
//     .default(() => Date.now()),
//   _destroy: Joi.boolean().default(false),
// });
// validate 1 lan nua truoc khi dua data vao CSDL
const USER_COLLECTION_SCHEMA = Joi.object({
  // 1. Đăng nhập
  email: Joi.string().email().required().trim().strict(),
  password: Joi.string().min(6).required().trim().strict(),
  
  // 2. Tên hiển thị (Dùng username như bạn muốn)
  username: Joi.string().required().trim().strict(), 

  // 3. Vai trò (BẮT BUỘC PHẢI CÓ - Để bảo vệ hệ thống)
  // Mặc định là 'client', bạn không cần gửi trường này từ form cũng được
  role: Joi.string().valid('client', 'admin').default('client'),

  // 4. Các thông tin phụ
  phoneNumber: Joi.string().trim().default(""),
  address: Joi.string().trim().default(""),
  avatar: Joi.string().trim().default(""),
  status: Joi.string().valid('active', 'inactive', 'blocked').default('active'),
  verify: Joi.boolean().default(false),

  createAt: Joi.date().timestamp("javascript").default(() => Date.now()),
  _destroy: Joi.boolean().default(false),
});

// thuc thi ham validation
const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};
const existingUser = async (email) => {
  try {
    const result = await getDB().collection(USER_COLLECTION_NAME).findOne({
      email: email,
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  try {
    const result = await getDB()
      .collection(USER_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const createNew = async (data) => {
  try {
    // kiem tra co pass qua dc validation hay khong
    const validData = await validateBeforeCreate(data);
    // kiem tra ton tai email hay chua
    const exist = await existingUser(data.email);
    if (exist) {
      return null;
    }
    // chuyen huong toi Database
    const createdProduct = await getDB()
      .collection(USER_COLLECTION_NAME)
      .insertOne(validData);
    // tra data ve cho service
    return createdProduct;
  } catch (error) {
    throw new Error(error);
  }
};

const login = async (data) => {
  try {
    const result = await getDB().collection(USER_COLLECTION_NAME).findOne({
      email: data.email,
      password: data.password,
    });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findByEmail = async (email) => {
  try {
    const result = await getDB().collection(USER_COLLECTION_NAME).findOne({
      email: email,
      _destroy: false,
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getAllUsers = async () => {
  try {
    const result = await getDB()
      .collection("users")
      .aggregate([
        { $match: { 
            _destroy: false,
            role: { $ne: "admin" } // $ne nghĩa là "Not Equal" (Không bằng)
          } },

        // --- CHIẾN THUẬT MỚI: KẾT NỐI BẰNG EMAIL ---
        // (Cách này gom được cả đơn hàng cũ bị sai ID)
        {
          $lookup: {
            from: "orders",
            localField: "email",       // Lấy Email của User
            foreignField: "email",     // So khớp với Email trong đơn hàng
            as: "userOrders"
          }
        },
        // -------------------------------------------

        // 2. Tính tổng số đơn hàng
        // (Lọc thêm điều kiện: chỉ đếm đơn chưa bị xóa mềm)
        {
          $addFields: {
            // Lọc mảng userOrders để loại bỏ các đơn bị xóa (_destroy: true)
            validOrders: {
              $filter: {
                input: "$userOrders",
                as: "order",
                cond: { $eq: ["$$order._destroy", false] }
              }
            }
          }
        },
        
        {
          $addFields: {
            totalOrders: { $size: "$validOrders" } // Đếm trên danh sách đã lọc
          }
        },

        // 3. Dọn dẹp
        {
          $project: {
            userOrders: 0,
            validOrders: 0,
            password: 0
          }
        },
        
        // 4. Sắp xếp
        { $sort: { createdAt: -1 } }
      ])
      .toArray();
      
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
// Hàm cập nhật thông tin user
const updateUser = async (id, data) => {
  try {
    // Loại bỏ các trường nhạy cảm không được sửa trực tiếp
    delete data._id;
    delete data.email;      // Không cho đổi email
    delete data.password;   // Không cho đổi pass (cần API riêng)
    delete data.createdAt;
    delete data.createAt;

    const result = await getDB()
      .collection("users") // Đảm bảo đúng tên collection
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
// Hàm xóa mềm user
const deleteUser = async (id) => {
  try {
    const result = await getDB()
      .collection(USER_COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { _destroy: true } }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
export const userModel = {
  findOneById,
  login,
  createNew,
  findByEmail,
  getAllUsers,
  updateUser,
  deleteUser,
};

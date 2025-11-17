import Joi from "joi";
import {getDB} from "../config/mongo.js";
import {ObjectId} from "mongodb";

// regex validate object_id
//const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;

const PRODUCT_COLLECTION_NAME = "products";

// validate 1 lan nua truoc khi dua data vao CSDL
// const PRODUCT_COLLECTION_SCHEMA = Joi.object({
//   name: Joi.string().required().trim().strict(),
//   price: Joi.number().required(),
//   description: Joi.string().required().trim().strict(),
//   image: Joi.array()
//     .items(Joi.string().required().trim().strict())
//     .min(1)
//     .required(),
//   category: Joi.string().default(""),
//   brand: Joi.string().default(""),
//   size: Joi.array().items(Joi.string().trim()).default([]),
//   color: Joi.array().items(Joi.string().trim()).default([]),
//   stock: Joi.number().integer().min(0).default(0),
//   createAt: Joi.date()
//     .timestamp("javascript")
//     .default(() => Date.now()),
//   _destroy: Joi.boolean().default(false),
// });

// // thuc thi ham validation
// const validateBeforeCreate = async (data) => {
//   return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, {
//     abortEarly: false,
//   });
// };
// Thay thế toàn bộ PRODUCT_COLLECTION_SCHEMA cũ bằng cái này
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().trim().strict(),
  price: Joi.number().required().min(0),
  description: Joi.string().required().trim().strict(),
  
  // Đã sửa từ 'image' thành 'images' để khớp với controller
  images: Joi.array()
    .items(Joi.string().required().trim().strict())
    .min(1)
    .required(),

  category: Joi.string().trim().strict().default(""),
  brand: Joi.string().trim().strict().default(""),
  
  // Vẫn giữ .array()
  size: Joi.array().items(Joi.string().trim()).default([]),
  color: Joi.array().items(Joi.string().trim()).default([]),
  
  stock: Joi.number().integer().min(0).default(0),

  // === Thêm các trường mới mà Controller đang gửi ===
  original_price: Joi.number().min(0).default(0),
  sku: Joi.string().trim().allow(null, ""), // Cho phép null hoặc rỗng
  ingredients: Joi.string().trim().allow(null, ""),
  usage_instructions: Joi.string().trim().allow(null, ""),
  status: Joi.string().trim().valid('active', 'draft').default('active'),  keywords: Joi.string().trim().allow(null, ""),
  featured: Joi.boolean().default(false),
  new_arrival: Joi.boolean().default(false),
  // === Hết các trường mới ===

  createAt: Joi.date()
    .timestamp("javascript")
    .default(() => Date.now()),
  _destroy: Joi.boolean().default(false),
});
// thuc thi ham validation
const validateBeforeCreate = async (data) => {
  return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const createNew = async (data) => {
  try {
    // kiem tra co pass qua dc validation hay khong
    const validData = await validateBeforeCreate(data);

    // chuyen huong toi Database
    const createdProduct = await getDB()
      .collection(PRODUCT_COLLECTION_NAME)
      .insertOne(validData);

    // tra data ve cho service
    return createdProduct;
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  try {
    const result = await getDB()
      .collection(PRODUCT_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getAllProducts = async () => {
  try {
    const result = await getDB()
      .collection(PRODUCT_COLLECTION_NAME)
      .find({})
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const updateProduct = async (id, data) => {
  try {
    // Lọc ra các trường không được phép cập nhật
    delete data.createAt;
    delete data._id; // Rất quan trọng, không cho phép cập nhật _id

    const result = await getDB()
      .collection(PRODUCT_COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id) }, // Tìm sản phẩm bằng ID
        { $set: data }             // $set dùng để cập nhật các trường trong data
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteProduct = async (id) => {
  try {
    const result = await getDB()
      .collection(PRODUCT_COLLECTION_NAME)
      .deleteOne({
        _id: new ObjectId(id),
      });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};
const searchProducts = async ({name}) => {
  try {
    const result = await getDB()
      .collection(PRODUCT_COLLECTION_NAME)
      .find({
        name: {$regex: name, $options: "i"}, // tìm tương tự, không phân biệt hoa thường
      })
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findByCategory = async (category) => {
  try {
    const result = await getDB()
      .collection(PRODUCT_COLLECTION_NAME)
      .find({
        category: {$regex: category, $options: "i"},
        _destroy: false,
      })
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findByBrand = async (brand) => {
  try {
    const result = await getDB()
      .collection(PRODUCT_COLLECTION_NAME)
      .find({
        brand: {$regex: brand, $options: "i"},
        _destroy: false,
      })
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findByPriceRange = async (minPrice, maxPrice) => {
  try {
    const query = {_destroy: false};
    if (minPrice !== undefined) query.price = {$gte: minPrice};
    if (maxPrice !== undefined) {
      query.price = query.price
        ? {...query.price, $lte: maxPrice}
        : {$lte: maxPrice};
    }

    const result = await getDB()
      .collection(PRODUCT_COLLECTION_NAME)
      .find(query)
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findFeaturedProducts = async () => {
  try {
    // Lấy sản phẩm có giá cao nhất (luxury products)
    const result = await getDB()
      .collection(PRODUCT_COLLECTION_NAME)
      .find({_destroy: false})
      .sort({price: -1})
      .limit(6)
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const findPopularProducts = async () => {
  try {
    // Lấy sản phẩm có stock cao (best sellers)
    const result = await getDB()
      .collection(PRODUCT_COLLECTION_NAME)
      .find({_destroy: false})
      .sort({stock: -1})
      .limit(8)
      .toArray();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getDistinctCategories = async () => {
  try {
    const result = await getDB()
      .collection(PRODUCT_COLLECTION_NAME)
      .aggregate([
        {$match: {_destroy: false}},
        {$group: {_id: "$category"}},
        {$sort: {_id: 1}},
      ])
      .toArray();

    const categories = result.map((item) => item._id);
    return categories;
  } catch (error) {
    throw new Error(error);
  }
};

const getDistinctBrands = async () => {
  try {
    const result = await getDB()
      .collection(PRODUCT_COLLECTION_NAME)
      .aggregate([
        {$match: {_destroy: false}},
        {$group: {_id: "$brand"}},
        {$sort: {_id: 1}},
      ])
      .toArray();

    const brands = result.map((item) => item._id);
    return brands;
  } catch (error) {
    throw new Error(error);
  }
};

export const productModel = {
  findOneById,
  getAllProducts,
  createNew,
  searchProducts,
  findByCategory,
  findByBrand,
  findByPriceRange,
  findFeaturedProducts,
  findPopularProducts,
  getDistinctCategories,
  getDistinctBrands,
  updateProduct,
  deleteProduct,
};

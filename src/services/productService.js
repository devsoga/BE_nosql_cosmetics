import {productModel} from "../models/productModel.js";

const createNew = async (reqBody) => {
  try {
    const newProduct = {
      ...reqBody,
    };
    // chuyen huong toi model
    const createdProduct = await productModel.createNew(newProduct);

    // tra data ve controller
    return createdProduct;
  } catch (error) {
    throw error;
  }
};

const getAllProducts = async () => {
  try {
    const listProduct = await productModel.getAllProducts();
    // lat tat ca pro
    return listProduct;
  } catch (error) {
    throw error;
  }
};

const getOneById = async (id) => {
  try {
    const product = await productModel.findOneById(id);
    // lat tat ca pro
    return product;
  } catch (error) {
    throw error;
  }
};

const searchItem = async (name) => {
  try {
    const product = await productModel.searchProducts(name);
    // lat tat ca pro
    return product;
  } catch (error) {
    throw error;
  }
};

const getByCategory = async (category) => {
  try {
    const products = await productModel.findByCategory(category);
    return products;
  } catch (error) {
    throw error;
  }
};

const getByBrand = async (brand) => {
  try {
    const products = await productModel.findByBrand(brand);
    return products;
  } catch (error) {
    throw error;
  }
};

const getByPriceRange = async ({minPrice, maxPrice}) => {
  try {
    const products = await productModel.findByPriceRange(minPrice, maxPrice);
    return products;
  } catch (error) {
    throw error;
  }
};

const getFeaturedProducts = async () => {
  try {
    const products = await productModel.findFeaturedProducts();
    return products;
  } catch (error) {
    throw error;
  }
};

const getPopularProducts = async () => {
  try {
    const products = await productModel.findPopularProducts();
    return products;
  } catch (error) {
    throw error;
  }
};

const getAllCategories = async () => {
  try {
    const categories = await productModel.getDistinctCategories();
    return categories;
  } catch (error) {
    throw error;
  }
};
const updateOneById = async (id, data) => {
  try {
    const result = await productModel.updateProduct(id, data);
    return result;
  } catch (error) {
    throw error;
  }
};

const deleteOneById = async (id) => {
  try {
    const result = await productModel.deleteProduct(id);
    return result;
  } catch (error) {
    throw error;
  }
};

const getAllBrands = async () => {
  try {
    const brands = await productModel.getDistinctBrands();
    return brands;
  } catch (error) {
    throw error;
  }
};

export const productService = {
  createNew,
  getAllProducts,
  getOneById,
  searchItem,
  getByCategory,
  getByBrand,
  getByPriceRange,
  getFeaturedProducts,
  getPopularProducts,
  getAllCategories,
  getAllBrands,
  updateOneById,
  deleteOneById,
};

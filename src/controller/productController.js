import {StatusCodes} from "http-status-codes";
import {productService} from "../services/productService.js";

const createNew = async (req, res, next) => {
  try {
    // chuyen huong sang service
    const createdProduct = await productService.createNew(req.body);

    // tra data ve client
    res.status(StatusCodes.CREATED).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const listProduct = await productService.getAllProducts();
    res.status(StatusCodes.OK).json(listProduct);
  } catch (error) {
    next(error);
  }
};

const getOneById = async (req, res, next) => {
  const {id} = req.params;
  try {
    const product = await productService.getOneById(id);
    res.status(StatusCodes.OK).json(product);
  } catch (error) {
    next(error);
  }
};

const searchItem = async (req, res, next) => {
  try {
    const listProduct = await productService.searchItem(req.body);
    res.status(StatusCodes.OK).json(listProduct);
  } catch (error) {
    next(error);
  }
};

const getByCategory = async (req, res, next) => {
  const {category} = req.params;
  try {
    const products = await productService.getByCategory(category);
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    next(error);
  }
};

const getByBrand = async (req, res, next) => {
  const {brand} = req.params;
  try {
    const products = await productService.getByBrand(brand);
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    next(error);
  }
};

const getByPriceRange = async (req, res, next) => {
  try {
    const products = await productService.getByPriceRange(req.body);
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await productService.getFeaturedProducts();
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    next(error);
  }
};

const getPopularProducts = async (req, res, next) => {
  try {
    const products = await productService.getPopularProducts();
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await productService.getAllCategories();
    res.status(StatusCodes.OK).json(categories);
  } catch (error) {
    next(error);
  }
};

const getAllBrands = async (req, res, next) => {
  try {
    const brands = await productService.getAllBrands();
    res.status(StatusCodes.OK).json(brands);
  } catch (error) {
    next(error);
  }
};

export const productController = {
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
};

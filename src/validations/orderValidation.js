import Joi from "joi";

// Regex để validate MongoDB ObjectId
const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;

const validValue = async (req, res, next) => {
  const orderItemSchema = Joi.object({
    productId: Joi.string().pattern(OBJECT_ID_RULE).required(),
    name: Joi.string().required(),
    size: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().required(),
    totalPrice: Joi.number().required(),
  });

  const correctCondition = Joi.object({
    userId: Joi.alternatives()
      .try(Joi.string().pattern(OBJECT_ID_RULE), Joi.string().trim())
      .required(),
    listProduct: Joi.array().items(orderItemSchema).min(1).required(),
    city: Joi.string().required().trim(),
    country: Joi.string().required().trim(),
    email: Joi.string().email().required().trim(),
    firstName: Joi.string().required().trim(),
    lastName: Joi.string().required().trim(),
    name: Joi.string().required().min(3).max(50).trim().strict(),
    phoneNumber: Joi.string().required().trim(),
    paymentMethod: Joi.string().required().trim(),
    streetAddress: Joi.string().required().trim(),
    totalPriceOrder: Joi.number().required(),
    note: Joi.string().allow(""),
    coupon: Joi.string().allow(""),
  });

  try {
    // console.log(req.body);
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      convert: true,
    });
    next();
  } catch (error) {
    // Trả về thông tin lỗi chi tiết
    res.status(400).json({
      message: "Validation failed",
      details: error.details.map((err) => err.message),
    });
  }
};

export const orderValidation = {
  validValue,
};

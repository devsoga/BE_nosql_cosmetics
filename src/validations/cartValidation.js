import Joi from "joi";

// Regex để validate MongoDB ObjectId
const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;

const validValue = async (req, res, next) => {
  const cartItemSchema = Joi.object({
    productId: Joi.string().pattern(OBJECT_ID_RULE).required(),
    name: Joi.string().required(),
    size: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    image: Joi.string().required(),
    price: Joi.number().required(),
  });

  const correctCondition = Joi.object({
    userId: Joi.alternatives()
      .try(Joi.string().pattern(OBJECT_ID_RULE), Joi.string().trim())
      .required(),
    item: cartItemSchema.required(),
  });

  try {
    await correctCondition.validateAsync(req.body, {abortEarly: false});
    next();
  } catch (error) {
    // Trả về thông tin lỗi chi tiết
    res.status(400).json({
      message: "Validation failed",
      details: error.details.map((err) => err.message),
    });
  }
};

export const cartValidation = {
  validValue,
};

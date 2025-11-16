import Joi from "joi";

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().trim().strict(),
    price: Joi.number().required(),
    description: Joi.string().required().trim().strict(),
    image: Joi.array()
      .items(Joi.string().required().trim().strict())
      .min(1)
      .required(),
  });

  try {
    await correctCondition.validateAsync(req.body, {abortEarly: false});
    next();
  } catch (error) {
    next(new Error(error));
    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
    //   error: new Error(error).message,
    // });
  }
};

export const productValidation = {
  createNew,
};

import Joi from "joi";

const validValue = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().email().required().trim().strict(),
    password: Joi.string().min(6).required().trim().strict(),
    username: Joi.string().required().trim().strict(),
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

export const userValidation = {
  validValue,
};

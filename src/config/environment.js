import "dotenv/config";

export const env = {
  MONGO_URI: process.env.MONGO_URI,
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  DATABASE_NAME: process.env.DATABASE_NAME,
  SEPAY_API_KEY: process.env.SEPAY_API_KEY,

  //   BUILD_MODE: process.env.BUILD_MODE,
};

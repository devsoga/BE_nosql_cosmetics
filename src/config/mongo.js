import {MongoClient, ServerApiVersion} from "mongodb";
import {env} from "./environment.js";

const mongo_uri = env.MONGO_URI;
const DATABASENAME = env.DATABASE_NAME;

let DATABASE = null;

// khoi tao doi tuong connect toi DB
const client = new MongoClient(mongo_uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const connectDB = async () => {
  await client.connect();
  DATABASE = client.db(DATABASENAME);
};

export const closeDB = async () => {
  await client.close();
};

export const getDB = () => {
  if (!DATABASE) throw new Error("Must connect to DB first!");
  return DATABASE;
};

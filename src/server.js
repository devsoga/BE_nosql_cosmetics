import 'dotenv/config'; // <--- THÊM DÒNG NÀY VÀO ĐẦU TIÊN
import express from "express";
import expressLayouts from "express-ejs-layouts";
import {connectDB} from "./config/mongo.js";
import {API} from "./routes/index.js";
import adminRoutes from "./routes/adminRoute.js";
import {errorHandlingMiddleware} from "./middlewares/errorHandlingMiddleware .js";
import cors from "cors";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const START_SERVER = () => {
  const app = express();
  const port = 8080;
  const host = "localhost";

  // Set EJS as view engine
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "../views"));
  // Enable layouts for EJS and set default admin layout
  app.use(expressLayouts);
  app.set("layout", "admin/layout");
  // Extract blocks to avoid undefined errors and move tags
  app.set("layout extractScripts", true);
  app.set("layout extractStyles", true);
  app.set("layout extractMeta", true);

  // Static files
  app.use("/static", express.static(path.join(__dirname, "../public")));
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // cors
  app.use(cors());
  // parse form data
  app.use(express.urlencoded({extended: true}));
  // use api
  app.use(express.json());
  app.use("/cosmetics-shop", API);
  app.use("/admin", adminRoutes);

  // middleware
  app.use(errorHandlingMiddleware);

  // chay local
  app.listen(port, host, () => {
    console.log(`Your server is running at: http://${host}:${port}`);
  });

  // deploy
  // app.listen(process.env.PORT, () => {
  //   console.log(`Your server is running at PORT: ${process.env.PORT}`);
  // });
};

connectDB()
  .then(() => {
    console.log("DB Connected");
  })
  .then(() => {
    START_SERVER();
  })
  .catch((err) => {
    console.log(err);
    process.exit(0);
  });

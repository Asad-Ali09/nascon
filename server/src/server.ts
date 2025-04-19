import "express-async-errors";
import cookieParser from "cookie-parser";
import express from "express";
import logger from "./utils/logger";
import morgan from "morgan";
import { port, morganFormat, mongoURI } from "./config";
import mongoose from "mongoose";
import apiRoutes from "./routes";
import errorHandler from "./middlewares/errorHandler";
import notFound from "./middlewares/notFound";
import { User } from "./types";
import cors from "cors";

declare module "express-serve-static-core" {
  export interface Request {
    user: User;
  }
}
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };

        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

app.get("/", (_, res) => {
  res.json({ message: "Hello World!" });
});

app.use("/api", apiRoutes);

app.use(errorHandler);
app.use(notFound);

mongoose
  .connect(mongoURI)
  .then(() => {
    app.listen(port, () => console.log(`Server is running on port ${port}`));
  })
  .catch((err: any) => {
    logger.error(err);
    process.exit(1);
  });

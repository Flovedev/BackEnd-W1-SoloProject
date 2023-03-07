import Express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import { join } from "path";
import productsRouter from "./api/products/index.js";
import reviewsRouter from "./api/reviews/index.js";
import filesRouter from "./api/files/index.js";
import {
  badRequestHandler,
  unauthorizedHandler,
  notfoundHandler,
  genericErrorHandler,
  checkRequests,
} from "./errorsHandlers.js";
import dotenv from "dotenv";

dotenv.config();

const server = Express();
const port = process.env.PORT;
const publicFolderPath = join(process.cwd(), "./public");
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROID_URL];

server.use(checkRequests);
server.use(Express.static(publicFolderPath));
server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(
          createHttpError(
            400,
            `Origin ${currentOrigin} is not in the whitelist!`
          )
        );
      }
    },
  })
);
server.use(Express.json());

server.use("/products", productsRouter);
server.use("/products", reviewsRouter);
server.use("/products", filesRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notfoundHandler);
server.use(genericErrorHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`Server is running in port ${process.env.PORT}`);
});

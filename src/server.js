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
} from "./errorsHandlers.js";

const server = Express();
const port = 3001;
const publicFolderPath = join(process.cwd(), "./public");

server.use(Express.static(publicFolderPath));
server.use(cors());
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
});

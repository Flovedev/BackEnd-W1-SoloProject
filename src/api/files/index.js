import Express from "express";
import multer from "multer";
import { extname } from "path";
import {
  saveProductsImages,
  getProducts,
  writeProducts,
} from "../../lib/fs-tools.js";

const filesRouter = Express.Router();

filesRouter.post(
  "/:id/upload",
  multer().single("image"),
  async (req, res, next) => {
    try {
      const productsArray = await getProducts();
      const index = productsArray.findIndex((e) => e._id === req.params.id);

      if (index !== -1) {
        const originalFileExtension = extname(req.file.originalname);
        const fileName = req.params.id + originalFileExtension;
        await saveProductsImages(fileName, req.file.buffer);

        const oldProduct = productsArray[index];
        const updatedProduct = {
          ...oldProduct,
          imageUrl: `localhost:3000/${fileName}`,
          updatedAt: new Date(),
        };

        productsArray[index] = updatedProduct;

        await writeProducts(productsArray);

        res.send({ message: "file uploaded" });
      } else {
        next(
          createHttpError(
            404,
            `Product with the id: ${req.params.id} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default filesRouter;

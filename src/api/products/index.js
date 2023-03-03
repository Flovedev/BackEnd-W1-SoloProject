import Express from "express";
import createHttpError from "http-errors";
import uniqid from "uniqid";
import { checkProductsSchema, triggerBadRequest } from "./validation.js";
import { getProducts, writeProducts } from "../../lib/fs-tools.js";

const productsRouter = Express.Router();

productsRouter.get("/", triggerBadRequest, async (req, res, next) => {
  try {
    const productsArray = await getProducts();
    res.send(productsArray);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:id", triggerBadRequest, async (req, res, next) => {
  try {
    const productsArray = await getProducts();
    const foundProduct = productsArray.find((e) => e._id === req.params.id);

    if (foundProduct) {
      res.send(foundProduct);
    } else {
      next(
        createHttpError(404, `Product with the id: ${req.params.id} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.post(
  "/",
  checkProductsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newProduct = {
        ...req.body,
        _id: uniqid(),
        imageUrl: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const productsArray = await getProducts();
      productsArray.push(newProduct);
      await writeProducts(productsArray);

      res.status(201).send({ created: `product with id: ${newProduct._id}` });
    } catch (error) {
      next(error);
    }
  }
);

productsRouter.put("/:id", triggerBadRequest, async (req, res, next) => {
  try {
    const productsArray = await getProducts();
    const index = productsArray.findIndex((e) => e._id === req.params.id);

    if (index !== -1) {
      const oldProduct = productsArray[index];
      const updatedProduct = {
        ...oldProduct,
        ...req.body,
        updatedAt: new Date(),
      };

      productsArray[index] = updatedProduct;
      await writeProducts(productsArray);

      res.send(updatedProduct);
    } else {
      next(
        createHttpError(404, `Product with the id: ${req.params.id} not found!`)
      );
    }
  } catch (error) {
    next(next);
  }
});

productsRouter.delete("/:id", triggerBadRequest, async (req, res, next) => {
  try {
    const productsArray = await getProducts();
    const remainingProducts = productsArray.filter(
      (e) => e._id !== req.params.id
    );

    if (productsArray.length !== remainingProducts.length) {
      await writeProducts(remainingProducts);

      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Product with the id: ${req.params.id} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

export default productsRouter;

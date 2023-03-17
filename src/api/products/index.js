import Express from "express";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import ProductsModel from "./model.js";
import { checkProductsSchema, triggerBadRequest } from "./validation.js";
import { getProducts, writeProducts } from "../../lib/fs-tools.js";

const productsRouter = Express.Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const { products, total } = await ProductsModel.findProductsWithReviews(
      mongoQuery
    );
    res.send({
      links: mongoQuery.links(process.env.MONGO_LINKS, total),
      total,
      numberOfPages: Math.ceil(total / mongoQuery.options.limit),
      products,
    });
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

productsRouter.post("/", async (req, res, next) => {
  try {
    const newPost = new ProductsModel(req.body);
    const { _id } = await newPost.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

productsRouter.put(
  "/:id",
  checkProductsSchema,
  triggerBadRequest,
  async (req, res, next) => {
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
          createHttpError(
            404,
            `Product with the id: ${req.params.id} not found!`
          )
        );
      }
    } catch (error) {
      next(next);
    }
  }
);

productsRouter.delete("/:id", async (req, res, next) => {
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

productsRouter.get("/category/:filter", async (req, res, next) => {
  try {
    const productsArray = await getProducts();
    const matchingProducts = productsArray.filter(
      (e) => e.category === req.params.filter
    );
    if (matchingProducts.length !== 0) {
      res.send(matchingProducts);
    } else {
      next(
        createHttpError(
          404,
          `Category with the name: ${req.params.filter} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default productsRouter;

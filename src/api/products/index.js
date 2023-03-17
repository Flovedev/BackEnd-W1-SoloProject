import Express from "express";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import ProductsModel from "./model.js";

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

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const foundProduct = await ProductsModel.findById(req.params.id);
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

productsRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedProduct = await ProductsModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (updatedProduct) {
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

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedProduct = await ProductsModel.findByIdAndDelete(req.params.id);
    if (deletedProduct) {
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

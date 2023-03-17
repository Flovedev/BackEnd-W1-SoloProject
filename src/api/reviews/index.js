import Express from "express";
import createHttpError from "http-errors";
import ReviewsModel from "./model.js";
import ProductsModel from "../products/model.js";

const reviewsRouter = Express.Router();

reviewsRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const productReviews = await ProductsModel.findById(
      req.params.productId
    ).populate({ path: "reviews", select: "comment rate" });
    if (productReviews) {
      res.send(productReviews.reviews);
    } else {
      createHttpError(
        404,
        `Product with the id: ${req.params.productId} not found!`
      );
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const productReviews = await ProductsModel.findById(
      req.params.productId
    ).populate({ path: "reviews", select: "comment rate" });
    if (!productReviews) {
      createHttpError(
        404,
        `Product with the id: ${req.params.productId} not found!`
      );
    }

    const foundReview = productReviews.reviews.filter(
      (e) => e._id.toString() === req.params.reviewId
    );
    if (!foundReview) {
      createHttpError(
        404,
        `Review with the id: ${req.params.reviewId} not found!`
      );
    }

    res.send(foundReview);
  } catch (error) {
    next(error);
  }
});

reviewsRouter.post("/:productId/reviews", async (req, res, next) => {
  try {
    const foundProduct = ProductsModel.findById(req.params.productId);
    if (foundProduct) {
      const newReview = new ReviewsModel(req.body);
      const { _id } = await newReview.save();
      const updteProduct = await ProductsModel.findByIdAndUpdate(
        req.params.productId,
        { $push: { reviews: _id } },
        { new: true, runValidators: true }
      );

      res.status(201).send({ NewReview: _id, updtedProduct: updteProduct });
    } else {
      createHttpError(
        404,
        `Product with the id: ${req.params.productId} not found!`
      );
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.put("/:productId/reviews/:reviewId", async (req, res, next) => {
  const foundProduct = await ProductsModel.findById(req.params.productId);
  if (!foundProduct) {
    createHttpError(
      404,
      `Product with the id: ${req.params.productId} not found!`
    );
  }
  const foundReview = await ReviewsModel.findByIdAndUpdate(
    req.params.reviewId,
    req.body,
    { new: true, runValidators: true }
  );
  if (!foundReview) {
    createHttpError(
      404,
      `Review with the id: ${req.params.reviewId} not found!`
    );
  }
  res.send(foundReview);
  try {
  } catch (error) {
    next(error);
  }
});

reviewsRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    const foundProduct = await ProductsModel.findById(req.params.productId);
    if (!foundProduct) {
      createHttpError(
        404,
        `Product with the id: ${req.params.productId} not found!`
      );
    }
    const foundReview = await ReviewsModel.findByIdAndDelete(
      req.params.reviewId
    );
    if (!foundReview) {
      createHttpError(
        404,
        `Review with the id: ${req.params.reviewId} not found!`
      );
    }
    res.status(204).send();
    try {
    } catch (error) {
      next(error);
    }
  }
);

export default reviewsRouter;

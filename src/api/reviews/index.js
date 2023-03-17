import Express from "express";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import ReviewsModel from "./model.js";
import ProductsModel from "../products/model.js";
import uniqid from "uniqid";
import { checkReviewsSchema, triggerBadRequest } from "./validation.js";
import { getReviews, writeReviews, getProducts } from "../../lib/fs-tools.js";

const reviewsRouter = Express.Router();

reviewsRouter.get("/:productId/reviews", async (req, res, next) => {
  try {
    const productsArray = await getProducts();
    const foundProduct = productsArray.find(
      (e) => e._id === req.params.productId
    );

    if (foundProduct) {
      const reviewsArray = await getReviews();
      res.send(reviewsArray);
    } else {
      next(
        createHttpError(404, `Product with the id: ${req.params.id} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

reviewsRouter.get("/:productId/reviews/:reviewId", async (req, res, next) => {
  try {
    const productsArray = await getProducts();
    const foundProduct = productsArray.find(
      (e) => e._id === req.params.productId
    );

    if (foundProduct) {
      const reviewsArray = await getReviews();
      const foundReview = reviewsArray.find(
        (e) => e._id === req.params.reviewId
      );

      if (foundReview) {
        res.send(foundReview);
      } else {
        next(
          createHttpError(
            404,
            `Review with the id: ${req.params.reviewId} not found!`
          )
        );
      }
    } else {
      next(
        createHttpError(
          404,
          `Product with the id: ${req.params.productId} not found!`
        )
      );
    }
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

reviewsRouter.put(
  "/:productId/reviews/:reviewId",
  checkReviewsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    const productsArray = await getProducts();
    const foundProduct = productsArray.find(
      (e) => e._id === req.params.productId
    );
    if (foundProduct) {
      const reviewsArray = await getReviews();
      const index = reviewsArray.findIndex(
        (e) => e._id === req.params.reviewId
      );
      if (index !== -1) {
        const oldReview = reviewsArray[index];
        const updatedReview = {
          ...oldReview,
          ...req.body,
          updatedAt: new Date(),
        };

        reviewsArray[index] = updatedReview;
        await writeReviews(reviewsArray);

        res.send(updatedReview);
      } else {
        next(
          createHttpError(
            404,
            `Review with the id: ${req.params.reviewId} not found!`
          )
        );
      }
    } else {
      createHttpError(404, `Product with the id: ${req.params.id} not found!`);
    }
    try {
    } catch (error) {
      next(error);
    }
  }
);

reviewsRouter.delete(
  "/:productId/reviews/:reviewId",
  async (req, res, next) => {
    const productsArray = await getProducts();
    const foundProduct = productsArray.find(
      (e) => e._id === req.params.productId
    );
    if (foundProduct) {
      const reviewsArray = await getReviews();
      const remainingReviews = reviewsArray.filter(
        (e) => e._id !== req.params.reviewId
      );

      if (reviewsArray.length !== remainingReviews.length) {
        await writeReviews(remainingReviews);

        res.status(204).send();
      } else {
        next(
          createHttpError(
            404,
            `Review with the id: ${req.params.reviewId} not found!`
          )
        );
      }
    } else {
      createHttpError(
        404,
        `Product with the id: ${req.params.productId} not found!`
      );
    }
    try {
    } catch (error) {
      next(error);
    }
  }
);

export default reviewsRouter;

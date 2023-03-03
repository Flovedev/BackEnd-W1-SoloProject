import Express from "express";
import uniqid from "uniqid";
import { checkReviewsSchema, triggerBadRequest } from "./validation.js";
import { getReviews, writeReviews, getProducts } from "../../lib/fs-tools.js";
import createHttpError from "http-errors";

const reviewsRouter = Express.Router();

reviewsRouter.get("/", (req, res, next) => {});

reviewsRouter.get("/:id", (req, res, next) => {});

reviewsRouter.post(
  "/:productId/reviews",
  checkReviewsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const productsArray = await getProducts();
      const index = productsArray.findIndex(
        (e) => e._id === req.params.productId
      );
      if (index !== -1) {
        const newReview = {
          ...req.body,
          _id: uniqid(),
          productId: req.params.productId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const reviewsArray = await getReviews();
        reviewsArray.push(newReview);
        await writeReviews(reviewsArray);

        res.status(201).send({
          Created: `Review created for the productId: ${req.params.productId}`,
        });
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
reviewsRouter.put("/", (req, res, next) => {});

reviewsRouter.delete("/", (req, res, next) => {});

export default reviewsRouter;

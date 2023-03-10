import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const reviewSchema = {
  comment: {
    in: ["body"],
    isString: {
      errorMessage: "Comment is a mandatory field and needs to be a string!",
    },
  },
  rate: {
    in: ["body"],
    isInt: {
      options: { min: 1, max: 5 },
      errorMessage:
        "Rate is a mandatory field and needs to be a number between 1 and 5!",
    },
  },
};

export const checkReviewsSchema = checkSchema(reviewSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    next();
  } else {
    next(
      createHttpError(400, "Errors during validation", {
        errorList: errors.array(),
      })
    );
  }
};

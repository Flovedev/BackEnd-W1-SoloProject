import Express from "express";
import uniqid from "uniqid";

const reviewsRouter = Express.Router();

reviewsRouter.get("/", (req, res, next) => {});
reviewsRouter.get("/:id", (req, res, next) => {});
reviewsRouter.post("/", (req, res, next) => {});
reviewsRouter.put("/", (req, res, next) => {});
reviewsRouter.delete("/", (req, res, next) => {});

export default reviewsRouter;

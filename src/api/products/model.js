import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productsSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    brand: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ["electronics", "home", "books", "sports", "pet", "beauty"],
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Reviews" }],
  },
  { timestamps: true }
);

productsSchema.static("findProductsWithReviews", async function (query) {
  const products = await this.find(query.criteria, query.options.fields)
    .limit(query.options.limit)
    .skip(query.options.skip)
    .sort(query.options.sort)
    .populate({ path: "reviews", select: "comment rate" });
  const total = await this.countDocuments(query.criteria);

  return { products, total };
});

export default model("Product", productsSchema);

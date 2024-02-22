const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, "Comment required"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review need to be asigne to a tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review need to be asigne to a user"],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

//QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "tour",
  //   select: "-__v",
  // }).populate({
  //   path: "user",
  //   select: "-__v -passwordChangedAt",
  // })
  this.populate({
    path: "user",
    select: "-__v -passwordChangedAt",
  })
  next()
})
const Review = mongoose.model("Review", reviewSchema)

module.exports = Review

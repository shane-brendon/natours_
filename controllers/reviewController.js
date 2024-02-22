const Review = require("../models/reviewModel")
const APIFeatures = require("../utils/APIFeatures")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const factoryHandler = require("./factoryHandlers")

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter
  if (req.params.tourId) filter = { tour: req.params.tourId }
  console.log(filter)
  const reviews = await Review.find(filter)
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  })
})
exports.CreateReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId
  req.body.user = req.user.id
  const newReview = await Review.create(req.body)
  res.status(201).json({
    status: `success`,
    data: {
      tour: newReview,
    },
  })
})

exports.deleteReview = factoryHandler.deleteOne(Review)

const Review = require('../models/reviewModel')
const factoryHandler = require('./factoryHandlers')
// const AppError = require("../utils/appError")
// const catchAsync = require("../utils/catchAsync")

exports.setTourAndUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId
  req.body.user = req.user.id
  next()
}

exports.getAllReviews = factoryHandler.getAll(Review)
exports.getReview = factoryHandler.getOne(Review)
exports.CreateReview = factoryHandler.createOne(Review)
exports.updateReview = factoryHandler.updateOne(Review)
exports.deleteReview = factoryHandler.deleteOne(Review)

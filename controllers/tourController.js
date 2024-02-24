const Tour = require("../models/tourModal")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const factoryHandler = require("./factoryHandlers")

// exports.checkBody = (req, res, next, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: "fail",
//       message: "Missing name or price",
//     });
//   }
//   next();
// };

exports.getAllTours = factoryHandler.getAll(Tour)
exports.getTour = factoryHandler.getOne(Tour, { path: "reviews" })
exports.createTour = factoryHandler.createOne(Tour)
exports.updateTour = factoryHandler.updateOne(Tour)
exports.deleteTour = factoryHandler.deleteOne(Tour)

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5"
  req.query.sort = "-ratingsAverage,price"
  req.query.fields = "name,price,ratingAverage,summary,difficulty"
  next()
}
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 },
        numRatings: { $sum: "$ratingQuantity" },
        avgRating: { $avg: "$ratingAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $avg: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    { $match: { _id: { $ne: "EAZY" } } },
  ])

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  })
})
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1
  const plans = await Tour.aggregate([
    { $unwind: "$startDates" },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$startDates",
        },
        numTOurStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    { $addFields: { month: "$_id" } },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTOurStarts: -1,
      },
    },
    {
      $limit: 12,
    },
  ])
  res.status(200).json({
    status: "success",
    data: {
      plans,
    },
  })
})

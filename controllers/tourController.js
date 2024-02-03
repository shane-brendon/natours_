const Tour = require("../models/tourModal")
const APIFeatures = require("../utils/APIFeatures")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")

// exports.checkBody = (req, res, next, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: "fail",
//       message: "Missing name or price",
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5"
  req.query.sort = "-ratingsAverage,price"
  req.query.fields = "name,price,ratingAverage,summary,difficulty"
  next()
}
exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

  const tours = await features.query

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  })
})
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id)
  if (!tour) {
    return next(new AppError("No tour found with that ID", 404))
  }
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  })
})
exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body)
  res.status(201).json({
    status: `sucess`,
    data: {
      tour: newTour,
    },
  })
})
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!tour) {
    return next(new AppError("No tour found with that ID", 404))
  }
  res.status(200).json({
    status: "sucess",
    data: {
      tour,
    },
  })
})
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id)
  if (!tour) {
    return next(new AppError("No tour found with that ID", 404))
  }
  res.status(204).json({
    status: "sucess",
    data: null,
  })
})

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
    status: "sucess",
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
    status: "sucess",
    data: {
      plans,
    },
  })
})

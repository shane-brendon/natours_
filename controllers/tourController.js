const Tour = require('../models/tourModal')
const AppError = require('../utils/appError')
const multer = require('multer')
const sharp = require('sharp')
const catchAsync = require('../utils/catchAsync')
const factoryHandler = require('./factoryHandlers')

// exports.checkBody = (req, res, next, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(404).json({
//       status: "fail",
//       message: "Missing name or price",
//     });
//   }
//   next();
// };

const multerStorage = multer.memoryStorage()
const multerFilter = (req, file, cb) => {
  console.log(file)
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(
      new AppError('unsupported file type, please provide a valid image', 404),
      false
    )
  }
}
const upload = multer({ storage: multerStorage, fileFilter: multerFilter })

exports.updateTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
])

// upload.single('image') for uploading a single image on req.file
// upload.array('images', 5) for uploading many images on req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  req.files.imageCover = `tour-${req.params.id}-${Date.now()}-cover`
  if (!req.files.imageCover || !req.files.images) return next()

  await sharp(req.file.imagesCover[0].buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.files.imageCover}`)

  req.body.images = []
  await promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}-cover`
      await sharp(req.file.imagesCover[0].buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`)
      req.body.images.push(filename)
    })
  )

  next()
})

exports.getAllTours = factoryHandler.getAll(Tour)
exports.getTour = factoryHandler.getOne(Tour, { path: 'reviews' })
exports.createTour = factoryHandler.createOne(Tour)
exports.updateTour = factoryHandler.updateOne(Tour)
exports.deleteTour = factoryHandler.deleteOne(Tour)

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingAverage,summary,difficulty'
  next()
}
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    { $match: { _id: { $ne: 'EAZY' } } },
  ])

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  })
})
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1
  const plans = await Tour.aggregate([
    { $unwind: '$startDates' },
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
          $month: '$startDates',
        },
        numTOurStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
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
    status: 'success',
    data: {
      plans,
    },
  })
})

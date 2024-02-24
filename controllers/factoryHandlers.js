const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")
const APIFeatures = require("../utils/APIFeatures")

//CRUD oprations

//CREATE
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body)
    res.status(201).json({
      status: `success`,
      data: {
        data: newDocument,
      },
    })
  })

//READ
exports.getOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    let query = await Model.findById(req.params.id)
    if (options) query = query.populate(options)

    const document = await query

    if (!document) {
      return next(new AppError("No document found with that ID", 404))
    }
    res.status(200).json({
      status: "success",
      data: {
        data: document,
      },
    })
  })

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter
    if (req.params.tourId) filter = { tour: req.params.tourId }

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const document = await features.query

    res.status(200).json({
      status: "success",
      results: Model.length,
      data: {
        data: document,
      },
    })
  })

//UPDATE
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!document) {
      return next(new AppError("No document found with that ID", 404))
    }
    res.status(200).json({
      status: "success",
      data: {
        data: document,
      },
    })
  })

//DELETE
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id)
    if (!document) {
      return next(new AppError("No document found with that ID", 404))
    }
    res.status(204).json({
      status: "success",
      data: null,
    })
  })

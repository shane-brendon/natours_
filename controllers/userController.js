const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")
const factoryHandler = require("./factoryHandlers")

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (!allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find()

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  })
})

exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const defaultUnauthorizedFields = [
    "password",
    "email",
    "role",
    "_id",
    "__v",
    "passwordConfirm",
  ]

  if (
    Object.keys(req.body).some((key) => defaultUnauthorizedFields.includes(key))
  ) {
    return next(new AppError("fields cannot be modified", 401))
  }

  const filteredBody = filterObj(req.body, ...defaultUnauthorizedFields)
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  })
})

exports.deleteUserProfile = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: "success",
    data: null,
  })
})

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route is not yer defined",
  })
}
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route is not yer defined",
  })
}
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route is not yer defined",
  })
}
exports.deleteUser = factoryHandler.deleteOne(User)

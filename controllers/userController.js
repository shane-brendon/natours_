const User = require('../models/userModel')
const multer = require('multer')
const sharp = require('sharp')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factoryHandler = require('./factoryHandlers')
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users')
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/').pop()
//     cb(null, `user-${req.user.id}-${Date.now()}-${ext}`)
//   },
// })
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

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next()

  req.file.filename = `user-${req.user.id}-${Date.now()}-jpeg`

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)

  next()
})

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (!allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}
exports.getCurrentUser = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  })
}

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'access denied, use /signup instead',
  })
}
exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const defaultUnauthorizedFields = [
    'password',
    'email',
    'role',
    '_id',
    '__v',
    'passwordConfirm',
  ]

  if (
    Object.keys(req.body).some((key) => defaultUnauthorizedFields.includes(key))
  ) {
    return next(new AppError('fields cannot be modified', 401))
  }

  const filteredBody = filterObj(req.body, ...defaultUnauthorizedFields)
  if (req.file) filteredBody.photo = req.file.filename
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  })

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  })
})
exports.deleteUserProfile = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null,
  })
})

exports.getAllUsers = factoryHandler.getAll(User)
exports.getUser = factoryHandler.getOne(User)
exports.updateUser = factoryHandler.updateOne(User)
exports.deleteUser = factoryHandler.deleteOne(User)

const { promisify } = require("util")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const appError = require("../utils/appError")

const signToken = (id, name) => {
  return jwt.sign({ id, name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  })
  const token = signToken(newUser._id, newUser.name)
  res.status(201).json({
    status: "sucess",
    token,
    data: {
      user: newUser,
    },
  })
  next()
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new appError("please provide email and password!", 404))
  }

  const user = await User.findOne({ email }).select("+password")

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new appError("Incorrect email or password", 401))
  }

  const token = signToken(user._id)
  res.status(201).json({
    status: "sucess",
    token,
  })
})

exports.protect = catchAsync(async (req, res, next) => {
  let token

  if (
    req.headers.authorisation &&
    req.headers.authorisation.startsWith("Bearer")
  ) {
    token = req.headers.authorisation.split(" ")[1]
  }

  if (!token) {
    return next(new appError("You are not logged in", 401))
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  const currentUser = await User.findById(decoded.id)

  if (!currentUser) {
    return next(new appError("User not found", 404))
  }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new appError("User recently changed possword!, Please log in again", 401)
    )
  }
  req.user = currentUser
  next()
})

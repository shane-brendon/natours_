const crypto = require("crypto")
const { promisify } = require("util")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const appError = require("../utils/appError")
const sendEmail = require("../utils/email")

const signToken = (id, name) => {
  return jwt.sign({ id, name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  res.status(statusCode).json({
    status: "sucess",
    token,
    data: {
      user,
    },
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    role: req.body.role,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires,
  })
  createAndSendToken(newUser, 201, res)
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
  createAndSendToken(user, 200, res)
})

exports.protect = catchAsync(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]
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

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new appError("Access denied", 403))
    }
    next()
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new appError("User not found", 404))
  }

  const resetToken = user.createPasswordResetToken()
  await user.save({ validateModifiedOnly: true })

  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`

  const message = `Forgot Password: ${resetURL}`

  try {
    await sendEmail({
      email: user.email,
      subject: `Reset password (only valid for the next 10min)`,
      message,
    })
    res.status(200).json({
      status: "sucess",
      message: "Token send",
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateModifiedOnly: true })

    return next(new appError("An error occur while sending the email", 500))
  }
})
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  console.log("password", hashedToken)
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })
  if (!user) {
    return next(new appError("Invalid or expired token", 400))
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined

  await user.save()
  createAndSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password")

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new appError("Incorrect password", 401))
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()

  createAndSendToken(user, 200, res)
})

const crypto = require("crypto")
const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "invalide email"],
    },
    photo: String,
    role: {
      type: String,
      enum: ["user", "guide", "lead-guide", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlenght: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "password confirmation required"],
      validate: {
        //this only works on SAVE and Create
        validator: function (el) {
          return el === this.password
        },
        message: "password are not the same",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
)
//DOCUMENT MIDDLEWARE
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined
  next()
})
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next()

  this.passwordChangedAt = Date.now() - 1000
  next()
})
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next()
  this.passwordChangedAt = Date.now() - 1000
  next()
})

//QUERY MIDDLEWATE
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } })

  next()
})

//METHODS ON THE UserShemaa object
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPasseword
) {
  return await bcrypt.compare(candidatePassword, userPasseword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )

    return JWTTimestamp < changedTimestamp
  }
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex")
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")
  console.log({ resetToken }, this.passwordResetToken)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}

const User = mongoose.model("User", userSchema)

module.exports = User

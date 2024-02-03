const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userShema = new mongoose.Schema({
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
  password: {
    type: String,
    required: [true, "password is required"],
    minlenght: 8,
    select:false
  },
  passwordConfirm: {
    type: String,
    required: [true, "password confirmation required"],
    validate: {
      //this only works on SAVE and Create
      validator: function (el) {
        return el === this.password;
      },
      message: "password are not the same",
    },
  },
});
userShema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userShema.methods.correctPassword = async function(candidatePassword, userPasseword) {
  return await bcrypt.compare(candidatePassword, userPasseword)
}
const User = mongoose.model("User", userShema);

module.exports = User;

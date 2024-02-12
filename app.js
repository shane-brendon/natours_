const express = require("express")
const morgan = require("morgan")

const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")
const AppError = require("./utils/appError")
const globalErrorHandler = require("./controllers/errorController")
const app = express()

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}
app.use(express.json())

app.use((req, res, next) => {
  next()
})

app.use("/api/v1/tours", tourRouter)
app.use("/api/v1/users", userRouter)

app.all("*", (req, res, next) => {
  console.log(new AppError("error", 404))
  next()
})

app.use(globalErrorHandler)

module.exports = app

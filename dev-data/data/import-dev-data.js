// eslint-disable-next-line import/no-extraneous-dependencies
const fs = require("fs")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const Tour = require("../../models/tourModal")

dotenv.config({ path: "./config.env" })
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
)

mongoose
  .connect(DB, {
    useNewUrlPasser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB connection successful"))

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"))

//import all data
const importData = async () => {
  try {
    await Tour.create(tours)
    console.log("successfully created")
  } catch (err) {
    console.log(err)
  }
  process.exit()
}

//Delete all data
const deleteData = async () => {
  try {
    await Tour.deleteMany()
    console.log("successfully delete")
  } catch (err) {
    console.log(err)
  }

  process.exit()
}

if (process.argv[2] === "--import") {
  importData()
} else if (process.argv[2] === "--delete") {
  deleteData()
}

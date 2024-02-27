const mongoose = require('mongoose')
const Tour = require('./tourModal')

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'Comment required'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review need to be asigne to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review need to be asigne to a user'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

//QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: '-__v -passwordChangedAt',
  })
  // this.populate({
  //   path: "tour",
  //   select: "-__v",
  // }).populate({
  //   path: "user",
  //   select: "-__v -passwordChangedAt",
  // })
  next()
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: 'rating' },
      },
    },
  ])

  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].nRating,
    ratingsQuantity: stats[0].avgRating,
  })
}

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour)
})

reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.tour)
  }
})
const Review = mongoose.model('Review', reviewSchema)

module.exports = Review

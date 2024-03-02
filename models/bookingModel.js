const mongoose = require('mongoose')

const bookingShema = new moongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    require: [true, 'booking must belong to a tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    require: [true, 'booking must belong to a user'],
  },
  price: {
    type: Number,
    require: [true, 'booking must have a price'],
  },
  createAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  }

})

bookingShema.pre(/^find/, function(next) {
    this.populate('user').populate({
        path: 'tour',
        Select: 'name'
    })
})
const Booking = mongoose.model('Booking', bookingShema)

module.exports = Booking
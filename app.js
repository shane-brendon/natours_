const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const mongoSantize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const AppError = require('./utils/appError')
const helmet = require('helmet')
const globalErrorHandler = require('./controllers/errorController')

const app = express()
// app.set('view engine', 'pug')
// app.set('views', path.join(__dirname, 'views'))

//SERVING STATIC PATH
app.use('/', express.static(path.join(__dirname, 'public')))

app.use(helmet())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'number of request exceeded, try again in one hour',
})

app.use('/api', limiter)

app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
// parse data comming from forms native submit
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

app.use(mongoSantize())
app.use(xss())

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'difficulty',
      'price',
      'maxGroupSize',
    ],
  })
)
// Routes FOR TEMPLATES
// app.get('/', (req, res, next) =>
//   res.status(200).render('base', { tour: 'the forest hiker', user: 'shane' })
// )

//GLOBAL MIDDLEWARE
app.use((req, res, next) => {
  // console.log(req.cookies)
  next()
})

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})
app.use(globalErrorHandler)

module.exports = app

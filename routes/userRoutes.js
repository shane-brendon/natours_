const express = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

const router = express.Router()

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

//as middleware runs in sequence, this line applies for all the code below it
router.use(authController.protect)

router.patch('/changePassword', authController.updatePassword)
router.patch('/updateUser', userController.updateUserProfile)
router.delete('/deleteUser', userController.deleteUserProfile)
router.get('/me', userController.getCurrentUser)

// only admins can access the routes below  this line
router.use(authController.restrictTo('admin'))

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser)
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router

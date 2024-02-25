const express = require("express")
const authController = require("../controllers/authController")
const reviewController = require("../controllers/reviewController")

const router = express.Router({ mergeParams: true })

//protect all the routes below this line
router.use(authController.protect)

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(authController.restrictTo("user"), reviewController.CreateReview)
router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.setTourAndUserId,
    reviewController.deleteReview
  )

module.exports = router


const express = require('express');

const router = express.Router({mergeParams: true});
//parameter like :id in the url defined in app.js will be considered valid here as well and vice-versa

const catchAsync = require('../utils/catchAsync');
const {validateReview} = require('../middleware');
const {isLoggedIn} = require('../middleware');
const {validateReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');


router.route('/').get(reviews.getReviewForm).post(validateReview, isLoggedIn, catchAsync(reviews.createReview));

router.delete('/:revId', isLoggedIn, validateReviewAuthor, catchAsync(reviews.deleteReview));


module.exports = router;
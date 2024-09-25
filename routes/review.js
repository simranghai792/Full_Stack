const express = require("express");
const router = express.Router({mergeParams : true});

const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js"); 
const Listing = require("../models/listing.js");
const {isLoggedIn,isReviewAuthor,validateReview} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

//Validate Review :-
/*Middleware bnna diya iska */

//Review Route :-
//1)POST Review Route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//2)DELETE Review Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;
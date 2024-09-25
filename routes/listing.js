const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });  /* abb multer hmari files koh cloudinary storage mai jaakr save krvaye gya by default */

 /* Here, we check joh humne listingSchema(server side schema) bnnaya hai, kya req.body voh pattern follow krr rahi hai */
//Validate Listing  :- (validation for schema) koh middleware ki form mai kaise likh skhte hai
/*Humne iska bii middleware bnna diya */

router
 .route("/")
//Index Route
 .get(wrapAsync(listingController.index))
//Create Route
 .post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));

//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);     /* New route koh show route seh code phle kiya, because varna "new" koh voh "id" smjte */

router
 .route("/:id")
//Show Route
 .get(wrapAsync(listingController.showListing))
//update route
 .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
//delete route
 .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

module.exports = router;
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");

const validateListing = (req,res,next) => {
  let {error} =  listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } 
  else next();
};

const validateReview = (req, res, next) => {
  let {error} = reviewSchema.validate(req.body);
  if(error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//Index Route
router.get(
  "/", 
  wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
  }));

//New Route
router.get("/new", (req,res) => {
  res.render("listings/new.ejs");
});

//Show Route
router.get(
  "/:id", 
  wrapAsync(async (req,res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if(!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", {listing});
}));

//Create Route
router.post(
  "/", 
  validateListing, wrapAsync (async (req, res) => {
//   let {title, description, image, price, country, location} = req.body;
// })  with the help of listing , object is created
const newListing = new Listing(req.body.listing);
await newListing.save();
req.flash("success", "New Listing Created!");
res.redirect("/listings");
}));

//Edit Route
router.get( 
  "/:id/edit",
  wrapAsync(async (req,res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs", {listing});
}));

//Update Route
router.put(
  "/:id",
  validateListing ,wrapAsync(async (req,res) => {
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
  res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete(
  "/:id", 
  wrapAsync(async (req,res) => {
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}));

module.exports = router;

// app.get("/testListing", async (req,res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     locaton: "Calangute, Goa",
//     coountry: "India"
//   });
//   await sampleListing.save();
//   console.log("Sample was saved");
//   res.send("Successful Testing");

// });


const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const ListingSchema = new Schema({
  title: {
    type: String,
    required: true,
}, 
  description: String,
  image: {
    filename: String,
    url: {
      type: String,
      default: "https://static.vecteezy.com/vite/assets/photo-masthead-375-BoK_p8LG.webp",
      set: (v) => v === "" ? "https://static.vecteezy.com/vite/assets/photo-masthead-375-BoK_p8LG.webp" : v,
    },
}, 
  price: Number,
  location: String,
  country: String,
  reviews: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
  },
  ],
});

ListingSchema.post("findOneAndDelete", async(listing) => {
  if(listing){
    await Review.deleteMany({_id: {$in: listing.reviews }});
  }
});

const Listing = mongoose.model("listing", ListingSchema);
module.exports = Listing;
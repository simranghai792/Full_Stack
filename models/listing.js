const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
     title: {
        type: String,
        required: true
     },
     description: {
        type: String,
     },
     image: {
      //   type: String,     /*Default property is used, when you don't explicitly define the image attribute. The set attribute is used when you define the image attribute but no value is given to it. */
      //   default: "https://img.freepik.com/free-photo/luxury-pool-villa-spectacular-contemporary-design-digital-art-real-estate-home-house-property-ge_1258-150755.jpg",
      //   set: (v) => v==="" ?  "https://img.freepik.com/free-photo/luxury-pool-villa-spectacular-contemporary-design-digital-art-real-estate-home-house-property-ge_1258-150755.jpg" : v,
       url : String,
       filename : String
     },
     price: {
        type: Number,
     },
     location: {
        type: String,
     },
     country: {
        type: String,
     },
     reviews: [
      {                 /*One to many relation(Approach 2) as each review is associated with each listing. */
         type: Schema.Types.ObjectId,
         ref: "Review",
      },
     ],
     owner : {
      type: Schema.Types.ObjectId,
      ref: "User",
     },
});

/* If listing is deleted, Toh uske reviews bii delete ho jaaye */
listingSchema.post("findOneAndDelete",async(listing)=>{
   if(listing){
   await Review.deleteMany({_id : {$in : listing.reviews}});   /* Joh listing.reviews kii ID k part hogyi, voh reviews bii delete ho jaaye gye. */
   }
});

const Listing = mongoose.model("Listing",listingSchema);

module.exports = Listing;
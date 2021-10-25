const mongoose = require("mongoose")
const User = require("./user")
const Review = require("./review")
const { Schema } = mongoose

const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: User,
  },
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
})

// Deletes the specific campground's associated reviews
//This is a query middleware
CampgroundSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    console.log(doc)
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    })
  }
})

module.exports = mongoose.model("Campground", CampgroundSchema)

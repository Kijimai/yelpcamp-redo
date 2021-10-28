const mongoose = require("mongoose")
const Review = require("./review")
const { Schema } = mongoose

const ImageSchema = new Schema({
  url: String,
  filename: String,
})

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200")
})

const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
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

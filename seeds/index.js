const mongoose = require("mongoose")
const cities = require("./cities")
const { places, descriptors } = require("./seedHelpers")
const Campground = require("../models/campground")

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error: "))
db.once("open", () => {
  console.log("Database connected")
})

const randomizeName = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const seedDB = async () => {
  await Campground.deleteMany({})
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000)
    const randomPlace = Math.floor(Math.random() * places.length)
    const randomDescriptor = Math.floor(Math.random() * descriptors.length)
    const randomPrice = Math.floor(Math.random() * 50) + 20
    const newCamp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${places[randomPlace]} ${descriptors[randomDescriptor]}`,
      image: `https://source.unsplash.com/collection/483251`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit aliquid culpa temporibus, hic, tenetur quo dolore illum ipsum nihil asperiores nisi explicabo aut! Est labore saepe fugit, quidem reprehenderit iusto!",
      price: randomPrice,
    })
    await newCamp.save()
  }
}

seedDB().then(() => db.close())

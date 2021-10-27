const Campground = require("../models/campground")

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({})
  res.render("campgrounds/index", { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new")
}

module.exports.createNewCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground)
  campground.images = req.files.map((file) => ({
    url: file.path,
    fileName: file.filename,
  }))
  campground.author = req.user._id
  await campground.save()
  console.log(campground)
  req.flash("success", "Successfully created a new campground!")
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author")
  console.log(campground)
  if (!campground) {
    req.flash("error", "Campground was not found!")
    return res.redirect("/campgrounds")
  }
  const reviews = campground.reviews
  res.render("campgrounds/show", { campground, reviews })
}

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  if (!campground) {
    req.flash("error", `Could not find that campground!`)
    return res.redirect("/campgrounds")
  }
  res.render("campgrounds/edit", { campground })
}

module.exports.editCampground = async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  })
  req.flash("success", "Update successful!")
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit this campground.")
    return res.redirect(`/campgrounds/${id}`)
  }
  await Campground.findByIdAndDelete(id)
  req.flash("success", "The campground has been removed!")
  res.redirect("/campgrounds")
}

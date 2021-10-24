module.exports.isLoggedIn = (req, res, next) => {
  console.log(req.user)
  if (!req.isAuthenticated()) {
    //store the requested route to be redirected back to it after logging in
    req.session.returnTo = req.originalUrl
    req.flash("error", "You must be signed in!")
    return res.redirect("/login")
  }
  next()
}

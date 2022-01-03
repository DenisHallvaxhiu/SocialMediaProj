const { redirect } = require("express/lib/response");

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return res.redirect("/dashboard")

    return next();
}

module.exports = { isLoggedIn }
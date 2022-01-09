// Check if the user is authenticated before proceeding with handling the request
function isAuthenticate(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

// Check if the user is logged in (for pages that we want to redirect to the dashboard if the user is currently logged in)
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return res.redirect("/dashboard")

    return next();
}

module.exports = { isAuthenticate, isLoggedIn }
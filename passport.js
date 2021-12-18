// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var connection = require('./database');
var bcrypt = require('bcrypt');


// FLOW OF THE PASSPORT LOGIC :
// https://www.bing.com/images/search?view=detailV2&ccid=AewBtooE&id=9042544C74C647E9D3395E12D6D33DF442AA39B5&thid=OIP.AewBtooEVhDs1PTQOaIQSgHaFO&mediaurl=https%3a%2f%2fi.pinimg.com%2foriginals%2f45%2f34%2f16%2f4534166722a822c4b8335504ee2b6fd0.png&cdnurl=https%3a%2f%2fth.bing.com%2fth%2fid%2fR.01ec01b68a045610ecd4f4d039a2104a%3frik%3dtTmqQvQ909YSXg%26pid%3dImgRaw%26r%3d0&exph=441&expw=624&q=flow+of+passport+local+strategy+&simid=608016895124047387&FORM=IRPRST&ck=5DC20969C1A01C44EE05484BA8252EEC&selectedIndex=0&ajaxhist=0&ajaxserp=0


// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.username);
    });

    // used to deserialize the user - to store into the req.user 
    passport.deserializeUser(function (username, done) {
        connection.query('SELECT * FROM User WHERE username = ?', [username], (err, user) => {
            done(err, { username: user[0].username, firstName: user[0].firstName, lastName: user[0].lastName })
        })
    });


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function (req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists

        connection.query('SELECT * FROM User WHERE username = ?', [email], async (err, user) => {
            var user = user[0];
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            var isValid = await bcrypt.compare(password,user.password);
            
            if (!isValid)
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        })


    }));
};


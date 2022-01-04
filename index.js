// DEPENDENCIES
const express = require('express')
const bcrypt = require('bcrypt')
const app = express()
const port = process.env.PORT || 3000
const connection = require('./database');
const middlewares = require('./middlewares/authenticate');
const loggedIn = require('./middlewares/isLoggedIn');
// passport dependencies
const passport = require('passport');
const flash = require('connect-flash')
const session = require('express-session');
const { redirect } = require('express/lib/response');
require('./passport')(passport); // pass passport for configuration


// MIDDLEWARES
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())

// passport middlewares
app.use(session({ secret: 'thisissecret' }))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); 


// ROUTES
app.get('/',loggedIn.isLoggedIn, (req, res) => {
  res.render('login', { message: '' });
})

app.get('/register', (req, res) => {
  res.render('register');
})

app.get('/logOut',middlewares.isAuthenticate,(req,res)=>{
  req.logOut();
  res.redirect("/")
})


app.get('/dashboard', middlewares.isAuthenticate, (req, res) => {

  connection.query("SELECT p.*, u.picture FROM Post p, User u WHERE p.username = u.username ORDER BY ID DESC", (err, result) => {
    if (err)
      redirect("/dashboard")
    else {
      const posts = result;
      res.render('dashboard', { posts: posts });
    }
  })
})

// Endpoint to handle the creation of a user's post
app.post('/createPost',middlewares.isAuthenticate, (req, res) => {
  // Extract the emotion, thoughts, and the username 

  let thought = req.body.thoughtsFields;
  let emotion = req.body.emotionSelection;
  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  let user = req.session.passport.user;

  try {
    connection.query("INSERT INTO post (`mood`, `date`, `username`, `thought`) VALUES (?,?,?,?)", [emotion,  date, user, thought], (err, result) => {
      if (err) {
        console.log(err)
      }
      else {
        res.redirect("/dashboard")
      }
    });
  }
  catch (e) {

  }

})

app.get('/profile',middlewares.isAuthenticate, (req, res) => {

  let username = req.session.passport.user;
//SELECT p.*, u.firstName, u.lastName FROM Post p, User u WHERE p.username = 'Denis24' AND u.username = 'Denis24' ORDER BY ID DESC;
  connection.query("SELECT * FROM Post  WHERE username = ?  ORDER BY ID DESC;", [username,username], (err, result) => {
    if (err)
      res.render('profile', { posts: [], message: 'There was an error loading the posts' });
    else {
      const posts = result;
      res.render('profile', { posts: posts,name:req.user.firstName + " " + req.user.lastName, description:req.user.description,picture:req.user.picture});
    }
  })
})

app.get('/deletePost/:postId',middlewares.isAuthenticate,function(req,res){
    connection.query("delete from post where id =" + req.params.postId,(err,result)=>{
      if(err){
        res.render('profile', { posts: [], message: 'There was an error deleting the post' });
      }
      else{
        res.redirect("/profile");
      }
    })
})

app.post('/registerUser', async (req, res) => {
  let userName = req.body.userName
  let firstName = req.body.fName
  let lastName = req.body.lName
  let email = req.body.email
  let password = req.body.password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    connection.query("SELECT username FROM user WHERE username = ?", [userName], (err, result, fields) => {
      if (result.length > 0) {
        console.log(userName + " exists")
      }
      else {
        connection.query("INSERT INTO  user (`username`, `password`, `firstName`, `lastName`, `email`) VALUES ('" + userName + "','" + hashedPassword + "','" + firstName + "','" + lastName + "','" + email + "')"
          , (err, result) => {
            if (err) {
              console.log(err)
            }
            else {
              res.redirect("/")
            }
          });
      }
    })
  } catch (error) {

  }
})

app.post('/loginUser', passport.authenticate('local-login', {
  successRedirect: '/dashboard', // redirect to the secure profile section
  failureRedirect: '/', // redirect back to the signup page if there is an error
  failureFlash: true // allow flash messages
}));

// ROUTES END


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
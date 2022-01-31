// DEPENDENCIES
const express = require('express')
const morgan = require('morgan');
const bcrypt = require('bcrypt')
const app = express()
const port = process.env.PORT || 3000
const connection = require('./database');
const middlewares = require('./middlewares/auth');
// passport dependencies
const passport = require('passport');
const flash = require('connect-flash')
const session = require('express-session');
const { redirect } = require('express/lib/response');
const { use } = require('passport');
require('./passport')(passport); // pass passport for configuration


// MIDDLEWARES
// main middlewares
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())
app.use(morgan('dev'))

// passport middlewares
app.use(session({ secret: 'thisissecret' }))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// ROUTES
app.get('/', middlewares.isLoggedIn, (req, res) => {
  res.render('login', { message: '' });
})

app.get('/register', middlewares.isLoggedIn, (req, res) => {
  res.render('register');
})

app.get('/logOut', middlewares.isAuthenticate, (req, res) => {
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

app.get('/profile', middlewares.isAuthenticate, (req, res) => {

  let username = req.session.passport.user;
  //SELECT p.*, u.firstName, u.lastName FROM Post p, User u WHERE p.username = 'Denis24' AND u.username = 'Denis24' ORDER BY ID DESC;
  connection.query("SELECT * FROM User LEFT JOIN post ON User.username = Post.username WHERE User.username = ? ORDER BY ID DESC;", [username], (err, result) => {
    if (err)
      res.render('profile', { posts: [], message: 'There was an error loading the posts' });
    else {
      const posts = result;
      res.render('profile', { posts: posts, button: true });
    }
  })
})



app.get('/settings', middlewares.isAuthenticate, (req, res) => {
  return res.send('Settings page is under construction');
})

app.get('/search', (req, res) => {
  let keyword = req.query.keyword;

  connection.query("Select username,firstName,lastName,picture,description from user where firstName LIKE ? or lastName Like ? or username like ? ", [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`], (err, result) => {
    if (err) {
      console.log(err)
    }
    else {
      const users = result;
      console.log(users)
      res.render('search', { users: users, keyword: keyword })
    }
  })
})

app.get(`/profile/:username`, (req, res) => {
  let user = req.params.username;
  connection.query("SELECT * FROM User LEFT JOIN post ON User.username = Post.username WHERE User.username = ? ORDER BY ID DESC;", [user], (err, result) => {
    if (err)
      res.render('profile', { posts: [], message: 'There was an error loading the posts' });
    else {
      console.log(result)
      const posts = result;
      res.render('profile', { posts: posts, button: false });

    }
  })
})

// Endpoint to handle the creation of a user's post
app.post('/createPost', middlewares.isAuthenticate, (req, res) => {
  // Extract the emotion, thoughts, and the username 

  let thought = req.body.thoughtsFields;
  let emotion = req.body.emotionSelection;
  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  let user = req.session.passport.user;

  connection.query("INSERT INTO post (`mood`, `date`, `username`, `thought`) VALUES (?,?,?,?)", [emotion, date, user, thought], (err, result) => {
    if (err) {
      console.log(err)
    }
    else {
      res.redirect("/dashboard")
    }
  });

})


app.get('/deletePost/:postId', middlewares.isAuthenticate, function (req, res) {
  connection.query("delete from post where id =" + req.params.postId, (err, result) => {
    if (err) {
      res.render('profile', { posts: [], message: 'There was an error deleting the post' });
    }
    else {
      res.redirect("/profile");
    }
  })
})

app.get('/messageUser/:roomId', function (req, res) {
  // NEED TO DO: Check if there is a room under that ID, if not create one, otherwise retrieve messages

  // RETRIEVE MESSAGES : TESTING using hard coded data
  var messages = [
    {
      id: 1,
      roomId: 'denis24-jtran',
      fromUserId: 'jtran',
      toUserId: 'denis24',
      message: 'Hey What is up man!!!!',
      createdOn: '2022-01-30 18:51:31' // NEED to write function to convert to correct timezone
    },
    {
      id: 2,
      roomId: 'denis24-jtran',
      fromUserId: 'denis24',
      toUserId: 'jtran',
      message: 'Chilling how about you?',
      createdOn: '2022-01-30 18:45:31'
    },
    {
      id: 3,
      roomId: 'denis24-jtran',
      fromUserId: 'jtran',
      toUserId: 'denis24',
      message: 'Nice bro same! :)',
      createdOn: '2022-01-30 18:59:31'
    }
  ];

  return res.render('message-user', { messages: messages });
})



app.post('/registerUser', async (req, res) => {
  let userName = req.body.userName
  let firstName = req.body.fName
  let lastName = req.body.lName
  let email = req.body.email
  let password = req.body.password
  const hashedPassword = await bcrypt.hash(password, 10);

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
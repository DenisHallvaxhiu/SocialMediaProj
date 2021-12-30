// DEPENDENCIES
const express = require('express')
const bcrypt = require('bcrypt')
const app = express()
const port = process.env.PORT || 3000
const connection = require('./database');
const middlewares = require('./middlewares/authenticate');
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
app.use(flash()); // use connect-flash for flash messages stored in session
// app.use((req,res,next) => {
//   console.log(req.user)
//   console.log(req.session)
//   next();
// })

// ROUTES
app.get('/', (req, res) => {
  res.render('login', { message: '' });
})

app.get('/register', (req, res) => {
  console.log(req.user)
  res.render('register');
})


app.get('/dashboard', middlewares.isLoggedIn, (req, res) => {
  console.log(req.user);
  // data: pretend like this is the data that is returned after we called it from the database
  // data: this is an array that contains objects which represents data of a particular post

  connection.query("SELECT * FROM post ORDER BY ID DESC", (err, result) => {
    if (err)
      redirect("/dashboard")
    else {
      const posts = result;
      res.render('dashboard', { posts: posts });
    }
  })



  // const posts = [
  //   {
  //     description: "Lorem Ipsum is industry. Lorem Ipsum has been theindustry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leapLorem Ipsum is industry. Lorem Ipsum has been theindustry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap",
  //     date: 'May 22, 2021',
  //     postedBy: 'Denis@gmail.com',
  //     profileUrl: 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png',
  //     mood: 'Sad'
  //   },
  //   {
  //     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been theindustry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap",
  //     date: 'April 20, 2021',
  //     postedBy: 'Khizer@gmail.com',
  //     profileUrl: 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png',
  //     mood: 'Happy'
  //   },
  //   {
  //     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been theindustry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap",
  //     date: 'November 20, 2021',
  //     postedBy: 'jimmytran16@gmail.com',
  //     profileUrl: 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png',
  //     mood: 'Happy'
  //   }, {
  //     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been theindustry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap",
  //     date: 'December 22, 2021',
  //     postedBy: 'jimmytran16@gmail.com',
  //     profileUrl: 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png',
  //     mood: 'Happy'
  //   }
  // ]
  // we will pass in a variable called 'posts' that will have the value of 'data' to the ejs/HTML webpage
})

// Endpoint to handle the creation of a user's post
app.post('/createPost', (req, res) => {
  console.log(req.body);
  console.log('the session', req.session.passport.user);
  // Extract the emotion, thoughts, and the username 

  let thought = req.body.thoughtsFields;
  let emotion = req.body.emotionSelection;
  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  let user = req.session.passport.user;


  console.log(thought + "  " + emotion + "  " + date + "  " + user)
  try {
    connection.query("INSERT INTO post (`mood`, `picture`, `date`, `username`, `thought`) VALUES (?,?,?,?,?)", [emotion, "https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png", date, user, thought], (err, result) => {
      if (err) {
        console.log(err)
      }
      else {
        console.log(user + " shared their thought")
        res.redirect("/dashboard")
      }
    });
  }
  catch (e) {

  }
  // Query to save the information


  // redirect back to the dashbard
})

app.get('/profile', (req, res) => {

  let username = req.session.passport.user;

  connection.query("SELECT * FROM post WHERE username = ? ORDER BY ID DESC;", [username], (err, result) => {
    if (err)
      res.render('profile', { posts: [], message: 'There was an error loading the posts' });
    else {
      const posts = result;
      res.render('profile', { posts: posts });
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
      if (err) console.log(err);
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
              console.log(userName + " registerd")
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
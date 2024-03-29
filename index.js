// DEPENDENCIES
const express = require('express')
const morgan = require('morgan');
const bcrypt = require('bcrypt')
const app = express()
const port = process.env.PORT || 3000
const connection = require('./database');
const middlewares = require('./middlewares/auth');
const http = require('http').Server(app)
const io = require("socket.io")(http);
// passport dependencies
const passport = require('passport');
const flash = require('connect-flash')
const session = require('express-session');
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
  
  // When user log in with the wrong credentials, there will be a flash message within the req.flash
  // REFERENCE : https://stackoverflow.com/questions/52567859/how-to-flash-a-message-from-passport-js
  
  // If there is a login message get the message from the array, otherwise make value an empty string
  const message = req.flash('loginMessage')[0] || '';
  res.render('login', { message: message });
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

app.get('/conversation', middlewares.isAuthenticate, (req, res) => {
  res.render('conversation')
})

app.get('/profile', middlewares.isAuthenticate, (req, res) => {

  let username = req.session.passport.user;

  connection.query("SELECT * FROM User LEFT JOIN post ON User.username = Post.username WHERE User.username = ? ORDER BY ID DESC;", [username], (err, result) => {
    if (err)
      res.render('profilev2', { posts: [], message: 'There was an error loading the posts' });
    else {
      const posts = result;
      res.render('profilev2', { posts: posts, button: true, msg: false });
    }
  })
})

app.get(`/profile/:username`, (req, res) => {
  let user = req.params.username;
  let user2 = req.session.passport.user;
  let roomId;
  connection.query("SELECT * FROM User LEFT JOIN post ON User.username = Post.username WHERE User.username = ? ORDER BY ID DESC;", [user], (err, result) => {
    if (err)
      res.render('profilev2', { posts: [], message: 'There was an error loading the posts' });
    else {
      console.log(result)
      const posts = result;
      if (user2 < user)
        roomId = user2.toLowerCase() + "-" + user.toLowerCase()
      else
        roomId = user.toLowerCase() + "-" + user2.toLowerCase()

      res.render('profilev2', { posts: posts, button: false, msg: true, user: user, room: roomId });
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

io.on('connection', (socket) => {
  socket.on('chat message', msg => {
    connection.query("Insert into messages (roomId,fromUserId,toUserId,message) Values (?,?,?,?)", [msg.room, msg.from, msg.to, msg.message], (err, result) => {
      if (err) {
        console.log(err)
      } else {
        console.log("Saved to db")
      }
    })
    io.to(msg.room).emit('get message', { msg: msg.message, from: msg.from, to: msg.to })
  })

  socket.on('join', room => {
    console.log(io);
    console.log("joined room " + room)
    socket.join(room)
  })

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


app.get('/messageUser/:roomId', middlewares.isAuthenticate, function (req, res) {
  // NEED TO DO: Check if there is a room under that ID, if not create one, otherwise retrieve messages
  var roomID = req.params.roomId;
  var user = req.session.passport.user.toLowerCase();
  var users = roomID.split('-')
  var toUser = (users[0] === user) ? users[1] : users[0]

  // If room id does not consist the user, then redirect to the dashboard
  if (!(users[0].toLowerCase() === user.toLowerCase() || users[1].toLowerCase() === user.toLowerCase())) {
    return res.redirect('/dashboard')
  }

  connection.query("SELECT * FROM rooms WHERE id = ?", [roomID], (err, result) => {
    if (err) console.log(err);
    else {
      console.log(result);
      // If room not exists, add it to db
      if (result.length === 0) {
        connection.query("INSERT INTO rooms(id) VALUES(?);", [roomID], (err, result) => {
          if (err) console.log(err);
        })
        return res.render('message-user', { messages: [], user: user, receiver: toUser, room: roomID });
      }
      // otherwise retrieve messsages from room
      else {
        connection.query("SELECT * FROM messages WHERE roomId = ?", [roomID], (err, messages) => {
          if (err) console.log(err);
          else {
            return res.render('message-user', { messages: messages, user: user, receiver: toUser, room: roomID });
          }
        })
      }
    }
  });
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
      connection.query("INSERT INTO user (username, password, firstName, lastName, email) VALUES (?,?,?,?,?)", [userName, hashedPassword, firstName, lastName, email],
        (err, result) => {
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
http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
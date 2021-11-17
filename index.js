const express = require('express')
const app = express()
const port =  process.env.PORT || 3000

app.use(express.static('public'))
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('login');
})

app.get('/register', (req, res) => {
  res.render('register');
})

app.get('/dashboard', (req, res) => {
  // data: pretend like this is the data that is returned after we called it from the database
  // data: this is an array that contains objects which represents data of a particular post
  const data = [
    {
      description: "Lorem Ipsum is industry. Lorem Ipsum has been theindustry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leapLorem Ipsum is industry. Lorem Ipsum has been theindustry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap",
      date: 'May 22, 2021',
      postedBy: 'Denis@gmail.com',
      profileUrl: 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png'
    },
    {
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been theindustry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap",
      date: 'April 20, 2021',
      postedBy: 'Khizer@gmail.com',
      profileUrl: 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png'
    },
    {
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been theindustry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap",
      date: 'November 20, 2021',
      postedBy: 'jimmytran16@gmail.com',
      profileUrl: 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png'
    },{
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been theindustry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap",
      date: 'December 22, 2021',
      postedBy: 'jimmytran16@gmail.com',
      profileUrl: 'https://cdn4.iconfinder.com/data/icons/user-people-2/48/6-512.png'
    }
  ]
  // we will pass in a variable called 'posts' that will have the value of 'data' to the ejs/HTML webpage
  res.render('dashboard', { posts: data });
})

app.get('/profile', (req, res) => {
  res.render('profile');
})


app.get('/loginUser', (req, res) => {
  // logic that authrencates the user
  // call thee database
  // authenticate if user is existing in the database
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
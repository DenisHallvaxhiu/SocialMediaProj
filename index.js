const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'))
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('login');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
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
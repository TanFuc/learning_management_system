const express = require('express');
const handlebars = require('express-handlebars');
const morgan = require('morgan')
const app = express()
const path = require('path');

// .env
require('dotenv').config()

// Khai báo port
const port = process.env.PORT || 3000;

// HTTP logger
app.use(morgan('combined'))

// Template engine
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

console.log(__dirname);

//Route
app.get('/', (req, res) => {
  res.render('home')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const express = require('express')
const app = express()
const port = 3000
var request = require('request')

var multer = require('multer')
var upload = multer()

const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(upload.array());
let data = " "
request('https://api.coingecko.com/api/v3/coins/bitcoin', function (error, response, body) {
  console.error('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', typeof body); // Print the HTML for the Google homepage.
  data = JSON.parse(body)
});

// Use app.get() for routing
app.get('/', (req, res) => {
  res.render('deshboard.ejs',{data}); 
});

app.get('/index', (req, res) => {
  res.render('index.ejs',{data}); 
});
app.get('/about', (req, res) => {
  res.render('about.ejs'); 
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
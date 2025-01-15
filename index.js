
const express = require('express')
const app = express()
const port = 3000

//app.use(express.static('public'));
app.set('view engine', 'ejs');
var data = "Hello World";

app.get('/', (req, res) => {
  res.render('index', {data});
})

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})
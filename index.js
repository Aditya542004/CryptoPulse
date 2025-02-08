const express = require("express");
const app = express();
const port = 3000;
var request = require("request");

var multer = require("multer");
var upload = multer();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(upload.array());
let data = "";
let coinName = "bitcoin";

async function resData(coinName) {
  var marketData = await new Promise((resolve, reject) => {
    request(
      "https://api.coingecko.com/api/v3/coins/" + coinName,
      function (error, response, body) {
        console.error("error:", error); // Print the error if one occurred
        console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
        console.log("body:", typeof body); // Print the HTML for the Google homepage.
        data = JSON.parse(body);
        console.log(data);
        resolve(data);
      }
    );
  });
}
// Use app.get() for routing
app.get("/", function (req, res) {
  resData(coinName);
  res.render("deshboard.ejs", { data });
});

app.get("/index", async (req, res) => {
  await resData(coinName);
  res.render("index.ejs", { data, coinName });
});

app.post("/index", async (req, res) => {
  coinName = req.body.selectCoin;
  await resData(coinName);
  res.render("index.ejs", { data, coinName });
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
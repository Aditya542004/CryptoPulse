const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const request = require("request");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 }); // cache expires every 60 seconds

const multer = require("multer");
const upload = multer();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(upload.array());

let data = "";
let chart = "";
let coinName = "bitcoin";







async function resData(coinName) {
  const cachedData = cache.get(coinName);
  if (cachedData && cachedData.data && cachedData.data.image) {
    console.log("Using cached data for:", coinName);
    data = cachedData.data;
    chart = cachedData.chart;
    return;
  }

  // Fetch coin data
  const marketData = await new Promise((resolve, reject) => {
    request(`https://api.coingecko.com/api/v3/coins/${coinName}`, function (error, response, body) {
      if (error || !body) return reject("Error fetching coin data");
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject("Invalid JSON in market data");
      }
    });
  });

  // Ensure structure is valid before continuing
  if (!marketData || !marketData.image || !marketData.image.large) {
    console.error("Invalid marketData structure:", marketData);
    throw new Error("Invalid data from API (missing image info)");
  }

  // Fetch chart data
  const marketChart = await new Promise((resolve, reject) => {
    request(`https://api.coingecko.com/api/v3/coins/${coinName}/market_chart?vs_currency=usd&days=30`, function (error, response, body) {
      if (error || !body) return reject("Error fetching chart data");
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject("Invalid JSON in market chart");
      }
    });
  });

  // Save to cache only if valid
  cache.set(coinName, { data: marketData, chart: marketChart });

  data = marketData;
  chart = marketChart;
}



// Routes
app.get("/", async function (req, res) {
  try {
    await resData(coinName);
    res.render("deshboard.ejs", { data });
  } catch (err) {
    res.status(500).send("API error: " + err);
  }
});

app.get("/index", async (req, res) => {
  try {
    await resData(coinName);
    res.render("index.ejs", { data, chart, coinName });
  } catch (err) {
    res.status(500).send("API error: " + err);
  }
});

app.post("/index", async (req, res) => {
  coinName = req.body.selectCoin;
  try {
    await resData(coinName);
    res.render("index.ejs", { data, chart, coinName });
  } catch (err) {
    res.status(500).send("API error: " + err);
  }
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

const http = require("http");

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`CryptoPulse dashboard running on port ${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Please stop the process using this port or use a different port.`);
    process.exit(1);
  } else {
    console.error("Server error:", error);
  }
});

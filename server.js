const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const app = express();
const port = 3000;

app.use(cors());
// Import the database functions
const db = require("./database");
db.initializeDatabase();

// Middleware for parsing JSON bodies
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/itemPriceTracker.html"));
});

// Endpoint to get items
app.get("/api/items", (req, res) => {
  db.getItems((err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

// Endpoint to add an item
app.post("/api/items", (req, res) => {
  const { name, price, place } = req.body;
  db.addItem(name, price, place, (err, result) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(201).json(result);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running!`);
});

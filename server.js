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

app.get("/api/items/search", (req, res) => {
  const { q, min, max, category } = req.query;
  db.searchItemsWithFilters(q, min, max, category, (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

// Endpoint to add an item
app.post("/api/items", (req, res) => {
  const { name, price, place, comments, category } = req.body;
  db.addItem(name, price, place, comments, category, (err, result) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(201).json(result);
    }
  });
});

// Endpoint to delete an item
app.delete("/api/items/:id", (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (password === "apa") {
    db.deleteItem(id, (err, result) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res
          .status(200)
          .json({ success: true, message: "Item deleted successfully" });
      }
    });
  } else {
    res
      .status(401)
      .json({ success: false, message: "Unauthorized: Incorrect password" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running!`);
});

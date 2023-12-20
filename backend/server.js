const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
// Import the database functions
const db = require("./database");

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

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
  console.log(`Server running at http://localhost:${port}`);
});

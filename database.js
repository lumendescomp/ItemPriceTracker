const sqlite3 = require("sqlite3").verbose();

// Connect to the SQLite database
const db = new sqlite3.Database("./mydb.sqlite3", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Create a table (if it doesn't exist)
db.run(`CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  place TEXT
)`);

// Function to get items
function getItems(callback) {
  const sql = `SELECT * FROM items`;
  db.all(sql, [], (err, rows) => {
    callback(err, rows);
  });
}

// Function to add an item
function addItem(name, price, place, callback) {
  const sql = `INSERT INTO items (name, price, place) VALUES (?, ?, ?)`;
  db.run(sql, [name, price, place], function (err) {
    callback(err, { id: this.lastID });
  });
}

module.exports = { getItems, addItem };

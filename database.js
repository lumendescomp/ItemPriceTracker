const { Pool } = require("pg");

// Create a new pool using the connection string from an environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Function to connect to the database
function initializeDatabase() {
  pool.connect((err, client, done) => {
    if (err) {
      console.error("Error connecting to the database:", err);
    } else {
      console.log("DATABASE CONNECTED");
    }
    done(); // This releases the client back to the pool
  });
}

// Function to get items
function getItems(callback) {
  pool.query("SELECT * FROM items", (err, result) => {
    callback(err, result.rows);
  });
}

// Function to add an item
function addItem(name, price, place, comments, category, callback) {
  pool.query(
    "INSERT INTO items (name, price, place, comments, category) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [name, price, place, comments, category],
    (err, result) => {
      callback(err, result.rows[0]);
    }
  );
}

// Function to delete an item
function deleteItem(id, callback) {
  pool.query("DELETE FROM items WHERE id = $1", [id], (err, result) => {
    callback(err, result);
  });
}

function searchItemsWithFilters(query, minPrice, maxPrice, category, callback) {
  const searchQuery = `%${query}%`;
  let queryText = `SELECT * FROM items WHERE name ILIKE $1 AND price >= $2 AND price <= $3`;
  let queryParams = [searchQuery, minPrice || 0, maxPrice || "Infinity"];

  if (category && category !== "") {
    queryText += ` AND category = $4`;
    queryParams.push(category);
  }

  pool.query(queryText, queryParams, (err, result) => {
    callback(err, result.rows);
  });
}

module.exports = {
  getItems,
  addItem,
  deleteItem,
  searchItemsWithFilters,
  initializeDatabase,
};

const { Pool } = require("pg");

// Create a new pool using the connection string from an environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    place TEXT
  )
`;

// Function to connect to the database and create the table
function initializeDatabase() {
  pool.connect((err, client, done) => {
    if (err) throw err;
    client.query(createTableQuery, (err, res) => {
      done();
      if (err) {
        console.error(err);
      } else {
        console.log("Table is successfully created");
      }
    });
  });
}

// Function to get items
function getItems(callback) {
  pool.query("SELECT * FROM items", (err, result) => {
    callback(err, result.rows);
  });
}

// Function to add an item
function addItem(name, price, place, callback) {
  pool.query(
    "INSERT INTO items (name, price, place) VALUES ($1, $2, $3) RETURNING id",
    [name, price, place],
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

function searchItemsWithPriceRange(query, minPrice, maxPrice, callback) {
  const searchQuery = `%${query}%`;
  const queryText = `
    SELECT * FROM items
    WHERE name ILIKE $1
    AND price >= $2
    AND price <= $3
  `;
  pool.query(
    queryText,
    [searchQuery, minPrice || 0, maxPrice || "Infinity"],
    (err, result) => {
      callback(err, result.rows);
    }
  );
}

module.exports = {
  getItems,
  addItem,
  deleteItem,
  searchItemsWithPriceRange,
  initializeDatabase,
};

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from frontend assets
app.use('/assets', express.static(path.join(__dirname, '../frontend/frontend/src/assets')));

const PORT = 5001;

// Static products data (read-only)
const staticProducts = [
  { id: 1, name: "Pepperoni Pizza", image: "http://localhost:5001/assets/pepperoni.jpg", price: 15.99 },
  { id: 2, name: "Margherita Pizza", image: "http://localhost:5001/assets/margherita.jpg", price: 11.99 },
  { id: 3, name: "PedroTech Special Pizza", image: "http://localhost:5001/assets/pedrotechspecial.jpg", price: 256.99 },
  { id: 4, name: "Vegan Pizza", image: "http://localhost:5001/assets/vegan.jpg", price: 17.99 },
  { id: 5, name: "Pineapple Pizza", image: "http://localhost:5001/assets/pineapple.jpg", price: 4.99 },
  { id: 6, name: "Very Expensive Pizza", image: "http://localhost:5001/assets/expensive.jpg", price: 699.99 },
];

// ✅ DB config (XAMPP)
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "pizza_db",
  waitForConnections: true,
  connectionLimit: 10,
});

// Test
app.get("/", (req, res) => {
  res.json({ message: "Pizza API running ✅" });
});

// ✅ GET all products
app.get("/api/products", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM products");
    connection.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET product by id
app.get("/api/products/:id", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    connection.release();
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADD product
app.post("/api/products", async (req, res) => {
  try {
    const { name, price, image, category } = req.body;
    if (!name || price == null)
      return res.status(400).json({ error: "name and price are required" });

    const connection = await pool.getConnection();
    const [result] = await connection.query("INSERT INTO products (name, price, image, category) VALUES (?, ?, ?, ?)", 
      [name, price, image || "", category || "pizza"]);
    connection.release();
    
    console.log("✅ Product added with ID:", result.insertId);
    res.status(201).json({
      id: result.insertId,
      name,
      price: parseFloat(price),
      image: image || "",
      category: category || "pizza",
    });
  } catch (err) {
    console.error("❌ Error adding product:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { name, price, image, category } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query("UPDATE products SET name = ?, price = ?, image = ?, category = ? WHERE id = ?", 
      [name, price, image, category, req.params.id]);
    connection.release();
    
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Updated ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    connection.release();
    
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API running: http://localhost:${PORT} and http://${localIP}:${PORT}`);
});

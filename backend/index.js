const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from frontend assets
app.use('/assets', express.static(path.join(__dirname, '../frontend/mhamad-react/src/assets')));

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
    res.json(staticProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET product by id
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = staticProducts.find(p => p.id == req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
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

    // Return success but don't add
    res.status(201).json({
      id: Date.now(),
      name,
      price,
      image: image || "",
      category: category || "pizza",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE product
app.put("/api/products/:id", async (req, res) => {
  try {
    const product = staticProducts.find(p => p.id == req.params.id);
    if (!product) return res.status(404).json({ error: "Not found" });

    // Return success but don't update
    res.json({ message: "Updated ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE product
app.delete("/api/products/:id", async (req, res) => {
  try {
    // Return success for any id (read-only)
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

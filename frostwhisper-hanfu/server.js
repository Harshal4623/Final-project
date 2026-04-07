const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3001;

/* Middleware */
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Serve static website files */
app.use(express.static(__dirname));

/* Database connection */
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "database.db");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database:", DB_PATH);
  }
});

/* Create tables and seed products */
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      category TEXT NOT NULL,
      occasion TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      zip TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

   
db.get(`SELECT COUNT(*) as count FROM products`, [], (err, row) => {
  if (err || row.count > 0) return; // already seeded, skip
 
  const products = [
    ["Soft Blossom Ruqun", 129, "images/blossom-ruqun.jpg", "Daily Wear", "Soft pink everyday Hanfu"],
    ["Moonlit Wedding Hanfu", 249, "images/moonlit-wedding-hanfu.jpg", "Wedding", "Luxury bridal Hanfu with flowing sleeves"],
    ["Pearl Hair Ornament Set", 39, "images/pearl-hair-ornament.jpg", "Accessories", "Elegant pearl and gold hair accessory"],
    ["Ivory Grace Ruqun", 139, "images/ivory-grace-ruqun.jpg", "Daily Wear", "Ivory layered Hanfu for elegant daywear"],
    ["Golden Phoenix Bridal Set", 289, "images/golden-phoenix-bridal-set.jpg", "Wedding", "Traditional red and gold wedding Hanfu"],
    ["Silk Ribbon Accessory Pack", 29, "images/silk-ribbon-accessory-pack.jpg", "Accessories", "Decorative silk ribbons for styling"],
    ["Spring Lantern Hanfu", 149, "images/spring-lantern-hanfu.jpg", "Festival", "Festival-inspired Hanfu with lantern details"],
    ["Jade Garden Hanfu", 169, "images/jade-garden-hanfu.jpg", "Festival", "Green floral Hanfu for celebrations"],
    ["Blossom Ruqun Premium", 179, "images/blossom-ruqun-2.jpg", "Daily Wear", "Premium ruqun with embroidered blossoms"],
    ["Royal Phoenix Crown Set", 89, "images/pearl-hair-ornament.jpg", "Accessories", "Bridal crown accessory inspired by royal Hanfu"]
  ];
 
  const stmt = db.prepare(`INSERT INTO products (name, price, image, category, occasion) VALUES (?, ?, ?, ?, ?)`);
  products.forEach((p) => stmt.run(p));
  stmt.finalize(() => console.log("Products seeded."));
});

  // const products = [
  //   [
  //     "Soft Blossom Ruqun",
  //     129,
  //     "images/blossom-ruqun.jpg",
  //     "Daily Wear",
  //     "Soft pink everyday Hanfu"
  //   ],
  //   [
  //     "Moonlit Wedding Hanfu",
  //     249,
  //     "images/moonlit-wedding-hanfu.jpg",
  //     "Wedding",
  //     "Luxury bridal Hanfu with flowing sleeves"
  //   ],
  //   [
  //     "Pearl Hair Ornament Set",
  //     39,
  //     "images/pearl-hair-ornament.jpg",
  //     "Accessories",
  //     "Elegant pearl and gold hair accessory"
  //   ],
  //   [
  //     "Ivory Grace Ruqun",
  //     139,
  //     "images/ivory-grace-ruqun.jpg",
  //     "Daily Wear",
  //     "Ivory layered Hanfu for elegant daywear"
  //   ],
  //   [
  //     "Golden Phoenix Bridal Set",
  //     289,
  //     "images/golden-phoenix-bridal-set.jpg",
  //     "Wedding",
  //     "Traditional red and gold wedding Hanfu"
  //   ],
  //   [
  //     "Silk Ribbon Accessory Pack",
  //     29,
  //     "images/silk-ribbon-accessory-pack.jpg",
  //     "Accessories",
  //     "Decorative silk ribbons for styling"
  //   ],
  //   [
  //     "Spring Lantern Hanfu",
  //     149,
  //     "images/spring-lantern-hanfu.jpg",
  //     "Festival",
  //     "Festival-inspired Hanfu with lantern details"
  //   ],
  //   [
  //     "Jade Garden Hanfu",
  //     169,
  //     "images/jade-garden-hanfu.jpg",
  //     "Festival",
  //     "Green floral Hanfu for celebrations"
  //   ],
  //   [
  //     "Blossom Ruqun Premium",
  //     179,
  //     "images/blossom-ruqun-2.jpg",
  //     "Daily Wear",
  //     "Premium ruqun with embroidered blossoms"
  //   ],
  //   [
  //     "Royal Phoenix Crown Set",
  //     89,
  //     "images/pearl-hair-ornament.jpg",
  //     "Accessories",
  //     "Bridal crown accessory inspired by royal Hanfu"
  //   ]
  // ];

  // db.run(`DELETE FROM products`, [], (deleteErr) => {
  //   if (deleteErr) {
  //     console.error("Delete products error:", deleteErr.message);
  //     return;
  //   }

  //   const stmt = db.prepare(`
  //     INSERT INTO products (name, price, image, category, occasion)
  //     VALUES (?, ?, ?, ?, ?)
  //   `);

  //   products.forEach((product) => {
  //     stmt.run(product, (insertErr) => {
  //       if (insertErr) {
  //         console.error("Insert product error:", insertErr.message);
  //       }
  //     });
  //   });

  //   stmt.finalize(() => {
  //     console.log("10 products inserted successfully.");
  //   });
  // });
});

/* Home route */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* Products API */
app.get("/api/products", (req, res) => {
  db.all(`SELECT * FROM products ORDER BY id ASC`, [], (err, rows) => {
    if (err) {
      console.error("Products fetch error:", err.message);
      return res.status(500).json({
        message: "Could not load products."
      });
    }

    res.json(rows);
  });
});

/* Register API */
app.post("/api/register", (req, res) => {
  const { fullName, email, password } = req.body;

  console.log("Register request body:", req.body);

  if (!fullName || !email || !password) {
    return res.status(400).json({
      message: "All fields are required."
    });
  }

  const sql = `
    INSERT INTO users (full_name, email, password)
    VALUES (?, ?, ?)
  `;

  db.run(sql, [fullName, email, password], function (err) {
    if (err) {
      console.error("Register error:", err.message);

      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({
          message: "An account with this email already exists."
        });
      }

      return res.status(500).json({
        message: "Could not create account."
      });
    }

    res.json({
      message: "Registration successful."
    });
  });
});

/* Login API */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  console.log("Login request body:", req.body);

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required."
    });
  }

  const sql = `
    SELECT * FROM users
    WHERE email = ? AND password = ?
  `;

  db.get(sql, [email, password], (err, user) => {
    if (err) {
      console.error("Login error:", err.message);
      return res.status(500).json({
        message: "Could not login."
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    res.json({
      message: "Login successful.",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email
      }
    });
  });
});

/* Save feedback */
app.post("/api/feedback", (req, res) => {
  const { customerName, message } = req.body;

  if (!message) {
    return res.status(400).json({
      message: "Feedback message is required."
    });
  }

  const sql = `
    INSERT INTO feedback (customer_name, message)
    VALUES (?, ?)
  `;

  db.run(sql, [customerName || "Verified Customer", message], function (err) {
    if (err) {
      console.error("Feedback save error:", err.message);
      return res.status(500).json({
        message: "Could not save feedback."
      });
    }

    res.json({
      message: "Feedback saved successfully."
    });
  });
});

/* Get feedback */
app.get("/api/feedback", (req, res) => {
  db.all(
    `SELECT * FROM feedback ORDER BY created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Feedback fetch error:", err.message);
        return res.status(500).json({
          message: "Could not fetch feedback."
        });
      }

      res.json(rows);
    }
  );
});

/* Place order */
app.post("/api/orders", (req, res) => {
  const {
    fullName,
    email,
    phone,
    address,
    city,
    country,
    zip,
    items,
    total
  } = req.body;

  if (
    !fullName ||
    !email ||
    !phone ||
    !address ||
    !city ||
    !country ||
    !zip ||
    !items ||
    !total
  ) {
    return res.status(400).json({
      message: "All checkout fields are required."
    });
  }

  const sql = `
    INSERT INTO orders (
      full_name,
      email,
      phone,
      address,
      city,
      country,
      zip,
      items,
      total
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      fullName,
      email,
      phone,
      address,
      city,
      country,
      zip,
      JSON.stringify(items),
      total
    ],
    function (err) {
      if (err) {
        console.error("Order error:", err.message);
        return res.status(500).json({
          message: "Could not place order."
        });
      }

      res.json({
        message: "Order placed successfully.",
        orderId: this.lastID
      });
    }
  );
});

/* Get all orders */
app.get("/api/orders", (req, res) => {
  db.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      console.error("Orders fetch error:", err.message);
      return res.status(500).json({
        message: "Could not fetch orders."
      });
    }

    res.json(rows);
  });
});


app.get("/api/orders/:email", (req, res) => {
  const { email } = req.params;
 
  db.all(
    `SELECT * FROM orders WHERE email = ? ORDER BY created_at DESC`,
    [email],
    (err, rows) => {
      if (err) {
        console.error("Orders by email error:", err.message);
        return res.status(500).json({ message: "Could not fetch orders." });
      }
 
      // Parse items JSON string back to array for each order
      const parsed = rows.map((order) => ({
        ...order,
        items: JSON.parse(order.items || "[]")
      }));
 
      res.json(parsed);
    }
  );
});

// GET /api/orders/:email  — fetch all orders for a logged-in user
// app.get("/api/orders/:email", (req, res) => {
//   const { email } = req.params;
//   try {
//     const orders = db.prepare(
//       "SELECT * FROM orders WHERE email = ? ORDER BY created_at DESC"
//     ).all(email);
 
//     const parsed = orders.map((order) => ({
//       ...order,
//       items: JSON.parse(order.items || "[]")
//     }));
 
//     return res.json(parsed);
//   } catch (err) {
//     console.error("Fetch orders error:", err);
//     return res.status(500).json({ message: "Could not fetch orders." });
//   }
// });

/* Start server */
/* Admin — Get all users */
app.get("/api/admin/users", (req, res) => {
  db.all(`SELECT * FROM users ORDER BY id ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Could not fetch users." });
    res.json(rows);
  });
});

const LISTEN_PORT = process.env.PORT || PORT;
app.listen(LISTEN_PORT, () => {
  console.log(`Server running at http://localhost:${LISTEN_PORT}`);
});
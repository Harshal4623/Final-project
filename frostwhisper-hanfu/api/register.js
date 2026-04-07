// ─────────────────────────────────────────────
// ADD THESE to your server.js / index.js
// Requires: npm install bcrypt
// ─────────────────────────────────────────────

const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

// POST /api/register
app.post("/api/register", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if email already exists
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    db.prepare(
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)"
    ).run(fullName, email, hashedPassword);

    return res.status(201).json({ message: "Registration successful! You can now log in." });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// POST /api/login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    // Store session (works if you have express-session set up)
    if (req.session) {
      req.session.userId = user.id;
      req.session.fullName = user.full_name;
    }

    return res.status(200).json({
      message: "Login successful!",
      user: { id: user.id, fullName: user.full_name, email: user.email }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});
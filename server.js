require('dotenv').config(); // Loads .env for local development

const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const app = express();

const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("❌ JWT_SECRET environment variable is required!");
    process.exit(1);
}

// Middleware
app.use(express.json());

// Read users.json
function loadUsers() {
    try {
        const data = fs.readFileSync('users.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('❌ Failed to load users.json:', err);
        return [];
    }
}

// Global user list
let users = loadUsers();

// Middleware: JWT Auth
function checkAuth(req, res, next) {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'Authorization token is required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// POST /auth - Login and get token
app.post("/auth", (req, res) => {
    const { username, key, processorId } = req.body;

    if (!username || !key || !processorId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const user = users.find(u =>
        u.username === username &&
        u.key === key
    );

    if (!user) {
        return res.status(403).json({ error: "Invalid username or key" });
    }

    if ((user.processorId || "").trim() !== (processorId || "").trim()) {
        return res.status(403).json({ error: "Invalid processor ID" });
    }

    // Generate JWT token
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ success: true, token });
});

// GET /protected - Example protected route
app.get('/protected', checkAuth, (req, res) => {
    res.json({ message: 'Protected content accessed.', user: req.user });
});

// Start server
app.listen(port, () => {
    console.log(`✅ Auth server running on port ${port}`);
});

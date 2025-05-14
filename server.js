require('dotenv').config();

const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const app = express();

const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("JWT_SECRET is missing in environment variables.");
    process.exit(1);
}

app.use(express.json());

// Load users from users.json
function loadUsers() {
    try {
        const data = fs.readFileSync('users.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Failed to read users.json:", err);
        return [];
    }
}

// Global users list
let users = loadUsers();

// Middleware to check JWT
function checkAuth(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// Auth route
app.post('/auth', (req, res) => {
    const { username, key, processorId } = req.body;

    if (!username || !key || !processorId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const user = users.find(u => u.username === username && u.key === key);

    if (!user) {
        return res.status(403).json({ error: "Invalid username or key" });
    }

    if (user.processorId !== processorId) {
        return res.status(403).json({ error: "Invalid processor ID" });
    }

    res.json({ success: true });
});

// Example protected route
app.get('/protected', checkAuth, (req, res) => {
    res.json({ message: "You have accessed protected data!", user: req.user });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

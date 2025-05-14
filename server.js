require('dotenv').config();  // This will load the environment variables for local development (not needed on Render directly)

const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const app = express();

// Use Render's dynamic port or 3000 as a fallback for local development
const port = process.env.PORT || 3000;

// Use the JWT_SECRET environment variable
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("JWT_SECRET environment variable is required!");
    process.exit(1);  // Exit the application if the secret is not set
}

// Middleware to parse JSON body
app.use(express.json());

// Read the users.json file
function loadUsers() {
    try {
        const data = fs.readFileSync('users.json', 'utf8'); // Read the file
        return JSON.parse(data); // Parse it as JSON
    } catch (err) {
        console.error('Failed to load users.json:', err);
        return [];
    }
}

// Simulating database
let users = loadUsers();

// Middleware to check for JWT token
function checkAuth(req, res, next) {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'Authorization token is required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Store the decoded user information in the request
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// Endpoint to authenticate user and generate a JWT token
app.post("/auth", (req, res) => {
    const { username, key, processorId } = req.body;

    if (!username || !key || !processorId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const users = JSON.parse(fs.readFileSync("users.json"));
    const user = users.find(u => u.username === username && u.key === key);

    if (!user) {
        return res.status(403).json({ error: "Invalid username or key" });
    }

    if (user.processorId !== processorId) {
        return res.status(403).json({ error: "Invalid processor ID" });
    }

    res.json({ success: true });
});


// Secure endpoint that requires authentication
app.get('/protected', checkAuth, (req, res) => {
    res.json({ message: 'This is protected data.', user: req.user });
});

app.listen(port, () => {
    console.log(`Auth server running on port ${port}`);
});

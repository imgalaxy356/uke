const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware to parse JSON body
app.use(express.json());  // Ensures the server can parse JSON data

// Log all requests to check if they are being received correctly
app.use((req, res, next) => {
    console.log("Received request:", req.method, req.url);
    console.log("Request body:", req.body);  // Log the body to check if it's being received
    next();
});

// Load users from users.json
let users = [];
fs.readFile('users.json', (err, data) => {
    if (err) {
        console.error('Failed to load users.json:', err);
    } else {
        users = JSON.parse(data);
        console.log("Users loaded:", users); // Log the loaded users
    }
});

// Authentication route
app.post('/auth', (req, res) => {
    const { username, key, hwid } = req.body;

    // Check if username and key match an entry in the users array
    const user = users.find(u => u.username === username && u.key === key);

    if (!user) {
        return res.json({ error: 'Invalid username or key' });
    }

    // Check if HWID matches
    if (user.hwid !== hwid) {
        return res.json({ error: 'HWID mismatch' });
    }

    // If username, key, and hwid match, return success
    return res.json({ success: true });
});

// Start the server and listen on port 3000 (Change to your render URL port in production)
app.listen(port, () => {
    console.log(`[+] Auth server running on http://localhost:${port}`);
});

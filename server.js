const express = require('express');
const fs = require('fs');
const app = express();

// Set the port to 10000 (or any other port you prefer)
const port = 10000;

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

    if (!username || !key || !hwid) {
        return res.json({ error: 'Missing required fields (username, key, hwid)' });
    }

    const user = users.find(u =>
        u.username === username &&
        u.key === key &&
        u.hwid === hwid  // 🔒 Enforces exact match
    );

    if (!user) {
        return res.json({ error: 'Invalid credentials or HWID' });
    }

    const expiresInDays = Math.floor((new Date(user.expires) - new Date()) / (1000 * 60 * 60 * 24));
    return res.json({
        success: true,
        keyExpiresIn: expiresInDays + " day(s)",
        keyRedeemedOn: user.redeemedOn || "N/A"
    });
});



// Start the server and listen on port 10000
app.listen(port, () => {
    console.log(`[+] Auth server running on https://uke.onrender.com:${port}`);
});

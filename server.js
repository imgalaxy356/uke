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

// Load users from users.json asynchronously
let users = [];
fs.readFile('users.json', (err, data) => {
    if (err) {
        console.error('Failed to load users.json:', err);
    } else {
        try {
            users = JSON.parse(data);
            console.log("Users loaded:", users); // Log the loaded users
        } catch (parseError) {
            console.error('Error parsing users.json:', parseError);
        }
    }
});

// Authentication route
app.post('/auth', (req, res) => {
    const { username, key, hwid } = req.body;

    // Log received data
    console.log(`Received username: ${username}, key: ${key}, hwid: ${hwid}`);

    // Check if username, key, and hwid are provided
    if (!username || !key || !hwid) {
        return res.json({ error: 'Missing required fields (username, key, hwid)' });
    }

    // Check if username and key match an entry in the users array
    const user = users.find(u => u.username === username && u.key === key);

    if (!user) {
        return res.json({ error: 'Invalid username or key' });
    }

    // Log user information
    console.log(`User found: ${user.username}, HWID: ${user.hwid}, Expires: ${user.expires}`);

    // Check if HWID matches
    if (user.hwid !== hwid) {
        return res.json({ error: 'HWID mismatch' });
    }

    // Check expiration
    const currentTime = Date.now();
    const expiresAt = user.expires * 1000; // Assuming 'expires' is in Unix timestamp format
    if (currentTime >= expiresAt) {
        return res.json({ error: 'Key has expired' });
    }

    // If username, key, and hwid match, return success
    return res.json({ 
        success: true, 
        expires_in_days: Math.floor((expiresAt - currentTime) / (1000 * 60 * 60 * 24))  // Calculate days until expiration
    });
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`[+] Auth server running on https://localhost:${port}`);
});

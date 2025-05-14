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

    if (!username || !key || !hwid) {
        return res.json({ error: 'Missing required fields (username, key, hwid)' });
    }

    const user = users.find(u => u.username === username && u.key === key);
    if (!user) {
        return res.json({ error: 'Invalid username or key' });
    }

    // Check expiration
    if (user.expires && new Date(user.expires) < new Date()) {
        return res.json({ expired: true, error: 'Key has expired' });
    }

    // HWID match or first-time bind
    if (!user.hwid) {
        user.hwid = hwid;
    } else if (user.hwid !== hwid) {
        return res.json({ error: 'HWID mismatch' });
    }

    // Check if already redeemed
    if (user.redeemed) {
        return res.json({ error: 'Key already redeemed' });
    }

    // Mark as redeemed and save
    user.redeemed = true;
    fs.writeFile('users.json', JSON.stringify(users, null, 2), err => {
        if (err) console.error("Failed to save updated users:", err);
    });

    // Return success with key expiration info
    let daysLeft = -1;
    if (user.expires) {
        const now = new Date();
        const expiresAt = new Date(user.expires);
        const diff = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
        daysLeft = diff;
    }

    return res.json({
        success: true,
        expires_in_days: daysLeft
    });
});


// Start the server and listen on the specified port
app.listen(port, () => {
    console.log([+] Auth server running on https://locomoco.onrender.com:${port});
});

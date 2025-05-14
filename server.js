const express = require('express');
const fs = require('fs');
const app = express();

// Use environment port for Render, fallback to 10000 locally
const port = process.env.PORT || 10000;

app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log("Body:", req.body);
    next();
});

// Load users.json once at startup
let users = [];
fs.readFile('users.json', (err, data) => {
    if (err) {
        console.error('Failed to load users.json:', err);
    } else {
        try {
            users = JSON.parse(data);
            console.log("Users loaded:", users);
        } catch (parseErr) {
            console.error('Error parsing users.json:', parseErr);
        }
    }
});

// /auth route
app.post('/auth', (req, res) => {
    const { username, key, hwid } = req.body;

    if (!username || !key || !hwid) {
        return res.json({ error: 'Missing required fields (username, key, hwid)' });
    }

    const user = users.find(u => u.username === username && u.key === key);

    if (!user) {
        return res.json({ error: 'Invalid username or key' });
    }

    if (user.hwid !== hwid) {
        return res.json({ error: 'HWID mismatch' });
    }

    const now = new Date();
    const expiresAt = new Date(user.expires);

    if (expiresAt < now) {
        return res.json({ error: 'Key has expired', expired: true });
    }

    // Optional: include expiration info
    const msLeft = expiresAt.getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

    return res.json({
        success: true,
        message: 'Authentication successful',
        keyRedeemedOn: user.redeemed || 'N/A',
        keyExpiresIn: `${daysLeft} day(s)`
    });
});



// Start the server and listen on the specified port
app.listen(port, () => {
    console.log([+] Auth server running on https://locomoco.onrender.com:${port});
});


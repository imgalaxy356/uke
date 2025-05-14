const express = require('express');
const fs = require('fs');
const app = express();

// Use the PORT environment variable or fallback to 3000 if not set
const port = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(express.json());

// Load users from users.json synchronously
let users = [];
try {
    const data = fs.readFileSync('users.json');
    users = JSON.parse(data);
    console.log("Users loaded:", users); // Log the loaded users
} catch (err) {
    console.error('Failed to load users.json:', err);
}

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

// Start the server and listen on the Render-assigned port
app.listen(port, () => {
    console.log(`[+] Auth server running on https://uke.onrender.com (port: ${port})`);
});

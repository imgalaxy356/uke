const express = require('express');
const fs = require('fs');
const app = express();


// Set the port to 10000 (or any other port you prefer)
const port = 10000;


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
    // Debugging output: Log the incoming request body
    console.log("Received request body:", req.body);

    const { username, key, hwid } = req.body;


    // Debugging output: Log the received parameters
    console.log("Received username:", username);
    console.log("Received key:", key);
    console.log("Received HWID:", hwid);

    // Check if username and key match an entry in the users array
    const user = users.find(u => u.username === username && u.key === key);

    if (!user) {
        console.log("Invalid username or key");  // Log error for invalid username or key
        return res.json({ error: 'Invalid username or key' });
    }

    // Check if HWID matches
    if (user.hwid !== hwid) {
        console.log("HWID mismatch");  // Log error for HWID mismatch
        return res.json({ error: 'HWID mismatch' });
    }

    // If username, key, and hwid match, return success
    console.log("Authentication successful");
    return res.json({ success: true });
});

// Start the server and listen on port 3000

    console.log("Received:", { username, key, hwid });

    const user = users.find(u =>
        u.username === username &&
        u.key === key &&
        u.hwid === hwid
    );

    if (!user) {
        console.log("No match found. Current users list:");
        console.log(users);
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
>>>>>>> 6f40ad819499e79fdb932599d80f2b245f7c7932
app.listen(port, () => {
    console.log(`[+] Auth server running on https://uke.onrender.com:${port}`);
});

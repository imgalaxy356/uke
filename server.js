const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

// Replace this secret with your own secret key
const JWT_SECRET = 'your-jwt-secret-key';

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
app.post('/auth', (req, res) => {
    const { username, key, hwid } = req.body;

    console.log("Received username:", username);  // Add this for debugging
    console.log("Received key:", key);            // Add this for debugging
    console.log("Received HWID:", hwid);          // Add this for debugging

    const user = users.find(u => u.username === username && u.key === key);

    if (!user) {
        return res.json({ error: 'Invalid username or key' });
    }

    if (user.hwid !== hwid) {
        return res.json({ error: 'HWID mismatch' });
    }

    return res.json({ success: true });
});


// Secure endpoint that requires authentication
app.get('/protected', checkAuth, (req, res) => {
    res.json({ message: 'This is protected data.', user: req.user });
});

app.listen(port, () => {
    console.log(`[+] Auth server running on http://localhost:${port}`);
});

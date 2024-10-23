const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load config
dotenv.config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get the API key
app.get('/api-key', (req, res) => {
    res.json({ apiKey: process.env.OPENAI_API_KEY });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

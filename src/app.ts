import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables.

const PORT = process.env.PORT || 8080;
const app = express(); // Initialize express app.

app.use(express.json()); // Parse body as JSON.

app.listen(PORT, () => {
    console.log(`Link Shortener App Listening on Port: ${PORT}`);
});
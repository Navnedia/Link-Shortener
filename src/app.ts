import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import {api, redirects} from './routes/index.js';
import {errorHandler} from './middleware/error-handler.js';
import AppError from './utils/appError.js';
import connectDB from './config/db.js';

dotenv.config(); // Load environment variables.
connectDB(); // Initalize connection to database.

const PORT = process.env.PORT || 8080;
const app = express(); // Initialize express app.

app.use(express.json()); // Parse body as JSON.
// Add origin allow header so this page can be acessed from other localhost ports:
// Add content-type to allowed headers so we can send body in fetch request:
app.use(cors({
    origin: "*",
    allowedHeaders: "Content-Type"
}));

app.listen(PORT, () => {
    console.log(`Link Shortener App Listening on Port: ${PORT}`);
});

// Direct endpoints:
app.use('/api', api); // Initialize endpoints under API.
app.use('', redirects); // Initialize redirect endpoints.

// Show error for undefined endpoints:
app.use('*', (req, res) => {
    return res.status(404).send(new AppError(404, 'Not Found', undefined, 
        `The endpoint (${req.method}) ${req.baseUrl + req.path} could not be found`));
});

app.use(errorHandler); // Initialize error handler middleware.
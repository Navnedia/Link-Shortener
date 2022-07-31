import express from 'express';
import dotenv from 'dotenv';

import {redirects} from './routes/index.js';
import {errorHandler} from './middleware/error-handler.js';
import AppError from './utils/appError.js';
import connectDB from './db.js';

dotenv.config(); // Load environment variables.
connectDB(); // Initalize connection to database.

const PORT = process.env.PORT || 8080;
const app = express(); // Initialize express app.

app.use(express.json()); // Parse body as JSON.

app.listen(PORT, () => {
    console.log(`Link Shortener App Listening on Port: ${PORT}`);
});

// Direct endpoints:
app.use('', redirects); // Initialize redirect endpoints.

// Show error for undefined endpoints:
app.use('*', (req, res) => {
    return res.status(404).send(new AppError(404, 'Not Found', undefined, 
        `The endpoint ${req.baseUrl + req.path} could not be found`));
});

app.use(errorHandler); // Initialize error handler middleware.
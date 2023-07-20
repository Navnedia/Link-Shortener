import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';

import {api, auth, redirects} from './routes/index.js';
import {errorHandler} from './middleware/error-handler.js';
import AppError from './utils/appError.js';
import configurePassport from './config/passport.js';
import connectDB from './config/db.js';
import { ensureGuest, ensureAuth } from './middleware/auth.js';


dotenv.config(); // Load environment variables.

// Configure passport authentication strategies:
configurePassport(passport);

const PORT = process.env.PORT || 8080;
const app = express(); // Initialize express app.

app.use(express.json()); // Parse body as JSON.

// Initialize session middleware:
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.MONGO_URI || ''})
    // cookie: { secure: true }
}));

// Add passport middleware for auth:
app.use(passport.initialize());
app.use(passport.session());

app.get('/', ensureGuest); // Only guests on the home/login page.
app.get('/dashboard', ensureAuth); // Only authorized users on the dashboard page.

// Host static frontend pages:
app.use(express.static('./frontend'));

// Direct endpoints:
app.use('/api', api); // Initialize endpoints under API.
app.use('/auth', auth); // Initialize endpoints under auth.
app.use('', redirects); // Initialize redirect endpoints.

// Show error for undefined endpoints:
app.use('*', (req, res) => {
    return res.status(404).send(new AppError(404, 'Not Found', undefined, 
    `The endpoint (${req.method}) ${req.baseUrl + req.path} could not be found`));
});

// Setup application:
connectDB().then(() => {  // Initialize connection to database.
    app.listen(PORT, () => {  // Start app listening on port.
        console.log(`Link Shortener App Listening on Port: ${PORT}`);
    });
});

app.use(errorHandler); // Initialize error handler middleware.

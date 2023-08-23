import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {api, auth, redirects} from './routes/index.js';
import {errorHandler} from './middleware/error-handler.js';
import configurePassport from './config/passport.js';
import connectDB from './config/db.js';
import { ensureGuest, ensureAuth } from './middleware/auth.js';


dotenv.config(); // Load environment variables.

// Configure passport authentication strategies:
configurePassport(passport);

const PORT = process.env.PORT || 8080;
const app = express(); // Initialize express app.

app.use(express.json()); // Parse body as JSON.

app.set('trust proxy', 1); // Trust first proxy.

// Initialize session middleware:
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.MONGO_URI || ''}),
    cookie: { 
        maxAge: 1707109200, // Retain login session for 400 Days.
        secure: app.get('env') === 'production' // Uses secure HTTPS cookie transfer when the NODE_ENV variable is set to production.
    }
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

// Show 404 error page for undefined endpoints:
app.use('*', (req, res) => {
    // return res.status(404).send(new AppError(404, 'Not Found', undefined, 
    // `The endpoint (${req.method}) ${req.baseUrl + req.path} could not be found`));
    return res.status(404).sendFile(path.join(__dirname, `../frontend/error/404/index.html`));
});

// Setup application:
connectDB().then(() => {  // Initialize connection to database.
    app.listen(PORT, () => {  // Start app listening on port.
        console.log(`Link Shortener App Listening on Port: ${PORT}`);
    });
});

app.use(errorHandler); // Initialize error handler middleware.

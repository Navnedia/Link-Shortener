import express from 'express';
import passport from 'passport';
import AppError from '../utils/appError.js';

const router = express.Router();

/**
 * Authenticate with google.
 * @route (GET) auth/google
 */
router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

/**
 * Google authentication callback.
 * @route (GET) auth/google/callback
 */
router.get('/google/callback', 
    passport.authenticate('google', {failureRedirect: '/'}), 
    (req, res) => {
        // On Successful auth, redirect to the home dashboard:
        res.redirect('/dashboard');
});

/**
 * Logout user.
 * @route (GET) auth/logout
 */
router.get('/logout', (req, res, done) => {
    req.logout(() => {
        res.redirect('/'); // Redirect to home login page.
    });
});

// Show 404 error page for undefined endpoints:
router.use('*', (req, res) => {
    return res.status(404).send(new AppError(404, 'Not Found', undefined, 
    `The endpoint (${req.method}) ${req.baseUrl + req.path} could not be found`));
});

export default router;
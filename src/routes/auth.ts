import express from 'express';
import passport from 'passport';

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

export default router;
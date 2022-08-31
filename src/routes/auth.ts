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
    passport.authenticate('google', {failureRedirect: '/login'}), 
    (req, res) => {
        // On Successful auth, redirect to the home dashboard:
        res.redirect('/');
});

export default router;
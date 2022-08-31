import {PassportStatic} from 'passport';
import passportGoogle from 'passport-google-oauth20';
import {User} from '../models/User.js';

const GoogleStrategy = passportGoogle.Strategy;

export default (passport: PassportStatic) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        console.log(profile);
    }));

    passport.serializeUser((req, user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user));
    });
};

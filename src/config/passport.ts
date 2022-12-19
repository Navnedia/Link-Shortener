import {PassportStatic} from 'passport';
import passportGoogle from 'passport-google-oauth20';
import {IUser, User} from '../models/User.js';

const GoogleStrategy = passportGoogle.Strategy;

export default (passport: PassportStatic) => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({googleId: profile.id});

            if (user) {
                done(null, user);
            } else {
                const data: IUser = {
                    googleId: profile.id,
                    email: profile.emails![0].value,
                    displayName: profile.displayName,
                    firstName: profile.name!.givenName,
                    lastName: profile.name!.familyName,
                    image: profile.photos![0].value
                };

                let newUser = await User.create(data);
                done(null, newUser);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));

    passport.serializeUser((req, user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user));
    });
};

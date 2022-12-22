import { Request, Response, NextFunction } from "express";

/**
 * Middleware for ensuring that a route is accessable visible by authenticated users.
 * If the user is NOT authenticted they will be redirected to the login page.
 */
export function ensureAuth(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/'); // Redirect authenticated user to login page.
    }
}

/**
 * Middleware for ensuring that a route is accessable visible by guest users (ex: login page).
 * If the user is already NOT authenticted they will be redirected to the dashboard.
 */
export function ensureGuest(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard'); // Redirect authenticated user to dashboard.
    } else {
        return next();
    }
}
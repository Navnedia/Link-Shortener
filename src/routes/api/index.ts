import express from 'express';
import mongoose from 'mongoose';
import trimmer from 'request_trimmer';
import AppError from '../../utils/appError.js';
import shortlinkRoutes from './shortlink-routes.js';

const router = express.Router();

router.use(trimmer.trim_body); // Middleware to trim request body properties.

router.use('/shortlinks', shortlinkRoutes);


export async function healthCheck(req, res) {
    try {
        const healthReport = {
            status: 200,
            appState: 'OK',
            dbState: mongoose.STATES[mongoose.connection.readyState],
            uptime: process.uptime(),
            timestamp: Date.now()
        }

        if (healthReport.dbState !== 'connected' && 
            healthReport.dbState !== 'connecting') {
            // Send with status code 500 if the datebase isn't working properly.
            healthReport.status = 500;
            return res.status(500).send(healthReport);
        } else {
            res.send(healthReport);
        }
    } catch (error) {
        return res.status(500).send(new AppError(500, 'Something went wrong :('));
    }
}

router.get('/healthcheck', healthCheck);

// Show 404 error page for undefined endpoints:
router.use('*', (req, res) => {
    return res.status(404).send(new AppError(404, 'Not Found', undefined, 
    `The endpoint (${req.method}) ${req.baseUrl + req.path} could not be found`));
});

export default router;
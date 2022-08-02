import express from 'express';
import trimmer from 'request_trimmer';
import shortlinkRoutes from './shortlink-routes.js';

const router = express.Router();

router.use(trimmer.trim_body); // Middleware to trim request body properties.

router.use('/shortlinks', shortlinkRoutes);

export default router;
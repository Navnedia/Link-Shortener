import express from 'express';
import shortlinkRoutes from './shortlink-routes.js';

const router = express.Router();

router.use('/shortlinks', shortlinkRoutes);

export default router;
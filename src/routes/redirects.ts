import express from 'express';
import {ShortLink} from '../models/ShortLink.js';
import AppError from '../utils/appError.js';

const router = express.Router();

/**
 * This route is incharge of redirecting all shortlink requests
 * to their appropirate destination url.
 * @route (GET) /{shortID}
*/
router.get('/:shortID', async (req, res) => {
    const shortLink = await ShortLink.findByShortID(req.params.shortID);

    // Check if the shortLink or the destination are undefined:
    if (!shortLink || !shortLink.destination) {
        // In the future this might be a error page instead!
        return res.status(404).send(new AppError(404, 'Not Found', undefined, 
            'Bad link or invalid url. Please ensure the casing is correct.'));
    }

    // Update click counter:
    await shortLink.set('clicks', shortLink.clicks + 1).save();
    
    return res.status(301).redirect(shortLink.destination); // Perform redirect.
});

// router.get('/api-docs');
// router.get('/');

export default router;

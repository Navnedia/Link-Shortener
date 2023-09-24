import express from 'express';
import {ShortLink} from '../models/ShortLink.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * This route is in charge of redirecting all shortlink requests
 * to their appropriate destination url.
 * @route (GET) /{shortID}
*/
router.get('/:shortID', async (req, res) => {
    const shortLink = await ShortLink.findByShortID(req.params.shortID);

    // Check if the shortLink or the destination are undefined:
    if (!shortLink || !shortLink.destination || shortLink.isBlocked) {
        return res.status(404).sendFile(path.join(__dirname, `../../frontend/error/404/index.html`)); // Show 404 error page.
    }

    await shortLink.set('clicks', shortLink.clicks + 1).save(); // Update click counter.
    return res.status(301).redirect(shortLink.destination); // Perform redirect.
});

export default router;

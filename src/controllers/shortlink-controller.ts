import express from 'express';
import {nanoid} from 'nanoid';
import {validURL, stringNotEmpty} from '../utils/validators.js';
import {ShortLink} from '../models/ShortLink.js';
import AppError from '../utils/appError.js';
import ValidationError from '../utils/validationError.js';
import { link } from 'fs';

/**
 * Create new shortlinks
 * @route (POST) api/shortlinks
 */
export async function createLink(req: express.Request, res: express.Response) {
    try {
        // Pull paramerters the user is allowed to set:
        var {destination} = req.body;
        const name = stringNotEmpty(req.body.name) 
            ? req.body.name : undefined; // Should this be a default name?
            
        /**
         * ! Validation will be refactored later to make it
         * ! more clean, reusable, and informitive to the end user.
         */

        // Make sure the the destination is a string:
        if (typeof destination !== 'string') {
            // Throw error if not a string:
            res.status(400);
            throw new AppError(400, "Validation Failed", [
                    new ValidationError("Invalid", "destination", 
                        "Destination must be a string")
                ], "Invalid or missing properties");
        }
        // If the destination url doesn't include a protocol, then add the http:// protocol by default:
        //! Temperary solution.
        if (!(destination.startsWith('http://') || destination.startsWith('https://'))) {
            destination = 'http://' + destination;
        }
        // Validate destination as containing a valid URL:
        if (!validURL(destination)) {
            // Throw error if invalid:
            res.status(400);
            throw new AppError(400, "Validation Failed", [
                    new ValidationError("Invalid", "destination", 
                        "Destination must be a valid URL")
                ], "Invalid or missing properties");
        }


        // Generate a unique shortID that hasn't already been asigned:
        //! Temperary solution, might extract out.
        var shortID;
        while (true) {
            shortID = nanoid(7);
            if (!(await ShortLink.findByShortID(shortID))) break;
        }

        // Create the new shortLink.
        const shortLink = await ShortLink.create({name, shortID, destination});

        // Format and return response:
        return res.status(200)
                  .set('Location', `api/shortlinks/${shortID}`)
                  .send(shortLink.getAPIResponse());
    } catch (error) {
        return res.send(error);
    }
}

/**
 * Returns an array of all shortlinks for the authenticated user
 * @route (GET) api/shortlinks
 */
 export async function getAllShortLinks(req: express.Request, res: express.Response) {
    try {
        const links = await ShortLink.find(); // Get all shortlink objects.
        const linkResponses: object[] = []; // Array to hold the formated responses.

        // Format each object into a clean API response with only the nessasary details:
        links.forEach(link => linkResponses.push(link.getAPIResponse()));

        return res.status(200).send(linkResponses);
    } catch (error) {
        // console.log(error);
        res.status(500).send(new AppError(500, 'Something went wrong :('));
    }
}

// /**
//  * @route () api/shortlinks
//  */
//  export async function name(req: express.Request, res: Express.eesponse) {
    
// }
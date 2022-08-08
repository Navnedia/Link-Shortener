import express from 'express';
import {nanoid} from 'nanoid';

import AppError from '../utils/appError.js';
import ValidationError from '../utils/validationError.js';
import {validURL, stringNotEmpty, validShortID} from '../utils/validators.js';
import {ShortLink, IShortLink} from '../models/ShortLink.js';
import test from 'node:test';


/**
 * Create a new shortlink
 * @route (POST) api/shortlinks
 */
export async function createOneLink(req: express.Request, res: express.Response) {
    try {
        // Create new shortlink with helper method and get response:
        const helperResponse = await createLink(req.body);

        if (helperResponse instanceof AppError) { // If response is error send error body:
            return res.status(helperResponse.statusCode).send(helperResponse);
        }

        // Format and return shortlink object response:
        return res.status(200)
                  .set('Location', `api/shortlinks/${(helperResponse as IShortLink).shortID}`)
                  .send(helperResponse);
    } catch (error) {
        // console.log(error);
        return res.status(500).send(new AppError(500, 'Something went wrong :('));
    }
}


/**
 * Create new shortlink(s)
 * @route (POST) api/shortlinks/bulk
 */
 export async function createBulkLinks(req: express.Request, res: express.Response) {
    try {
        const requestBody = req.body;
        const linkResponses: object[] = [];

        // Validate that the body is an array with length greater that zero:
        if (!Array.isArray(requestBody) || requestBody.length <= 0) {
            // Return 400 error:
            return res.status(400).send(new AppError(400, 'Bad Request', undefined,
                'Request body must be an array of JSON objects with length greater than 0'));
        }

        // Loop through and create each link from the request:
        for (const linkRequest of requestBody) {
            const helperResponse = await createLink(linkRequest); // Attempt to create the new link.
            // If the response was an error, then set the status code to 207 (i.e. Multi-Status):
            if (helperResponse instanceof AppError) res.status(207);
            linkResponses.push(helperResponse); // Add to responses array.
        }

        // Return & send created link responses:
        return res.send(linkResponses);
    } catch (error) {
        // console.log(error);
        return res.status(500).send(new AppError(500, 'Something went wrong :('));
    }
}



/**
 * Helper method for creating a new shortlink. This is used to help improve
 * code reuseability for the diffrent post methods for creating one link, or
 * links in bulk.
 * 
 * @returns If creation goes well, this will return the API response for the
 * new shortlink, but if things don't go correctly it will return an AppError
 * object.
 */
 export async function createLink(linkRequest): Promise<object | AppError> {
    try {
        // Pull paramerters the user is allowed to set:
        const name = stringNotEmpty(linkRequest.name) 
            ? linkRequest.name : undefined; // Should this be a default name?
        var {destination} = linkRequest;
            
        /**
         * ! Validation will be refactored later to make it
         * ! more clean, reusable, and informitive to the end user.
         */

        // Make sure the the destination is a string:
        if (typeof destination !== 'string') {
            // Return 400 error if not a string
            return new AppError(400, 'Validation Failed', [

                    new ValidationError('Invalid', 'destination', 
                        'Destination must be set and of type string')
                        
                ], 'Invalid or missing properties');
        }
        // If the destination url doesn't include a protocol, then add the http:// protocol by default:
        //! Temperary solution.
        if (!(destination.startsWith('http://') || destination.startsWith('https://'))) {
            destination = 'http://' + destination;
        }
        // Validate destination as containing a valid URL:
        if (!validURL(destination)) {
            // Return 400 error if not valid URL:
            return new AppError(400, 'Validation Failed', [
                    new ValidationError('Invalid', 'destination', 
                        'Destination must be a valid URL')
                ], 'Invalid or missing properties');
        }


        // Generate a unique shortID that hasn't already been asigned:
        //! Temperary solution, might extract out.
        var shortID;
        while (true) {
            shortID = nanoid(7);
            if (!(await ShortLink.findByShortID(shortID))) break;
        }

        /**
         * Put properties into a data object so we can easily
         * add all the data in one go, and so we can attach the
         * date.
         */
         const data = {
            name: name,
            shortID: shortID,
            destination: destination,
            created: new Date()
        };

        // Create the new shortLink.
        const shortLink = await ShortLink.create(data);

        // Set status code & return formated shortlink object response:
        return shortLink.getAPIResponse();
    } catch (error) {
        // console.log(error);
        return new AppError(500, 'Something went wrong :(');
    }
}



/**
 * Returns an array of all shortlinks for the authenticated user
 * @route (GET) api/shortlinks
 */
 export async function getAllLinks(req: express.Request, res: express.Response) {
    try {
        const links = await ShortLink.find(); // Get all shortlink objects.
        const linkResponses: object[] = []; // Array to hold the formated responses.

        // Format each object into a clean API response with only the nessasary details:
        links.forEach(link => linkResponses.push(link.getAPIResponse()));

        return res.status(200).send(linkResponses); // Return formated shortlink object.
    } catch (error) {
        // console.log(error);
        return res.status(500).send(new AppError(500, 'Something went wrong :('));
    }
}


/**
 * Returns a shortlink with the specified shortID
 * @route (GET) api/shortlinks/{shortID}
 */
 export async function getOneLink(req: express.Request, res: express.Response) {
    try { 
        const link = await ShortLink.findByShortID(req.params.shortID); // Get shortlink object for shortID.

        // If the shortlink doesn't exist, we return an error:
        if (!link) {
            return res.status(404).send(new AppError(404, 'Not Found', undefined,
                'No shortink was found for the requested shortID'));
        }

        return res.status(200).send(link.getAPIResponse()); // Return formated shortlink object.
    } catch (error) {
        // console.log(error);
        return res.status(500).send(new AppError(500, 'Something went wrong :('));
    }
}


/**
 * Updates an existing shortlinks with the spesified shortID
 * @route (PATCH) api/shortlinks/{shortID}
 */
 export async function updateLink(req: express.Request, res: express.Response) {
    try {
        // Make sure the requested shortlink exists first.
        const shortLink = await ShortLink.findByShortID(req.params.shortID); // Get shortlink by shortID.
        if (!shortLink) { // If we don't have a matching shortlink then we return a 404 error.
            return res.status(404).send(new AppError(404, 'Not Found', undefined,
                'No shortink was found for the requested shortID'));
        }

        // Pull paramerters the user is allowed to set:
        const name = stringNotEmpty(req.body.name) 
            ? req.body.name : undefined; // Get name from body if it exists.
        const shortID = stringNotEmpty(req.body.shortID) 
            ? req.body.shortID : undefined; // Get shortID from body if it exists.
        var destination = stringNotEmpty(req.body.destination) 
            ? req.body.destination : undefined; // Get destination from body if it exists.
        //! Is the string check here repetative. How can I improve this, or do I need to wait for validation?

        /**
         * ! Validation will be refactored later to make it
         * ! more clean, reusable, and informitive to the end user.
         */

        // If the destination property was provided, run validation checks.
        if (destination) {
            // Make sure the the destination is a string:
            if (typeof destination !== 'string') {
                // Send 400 error if not a string
                return res.status(400).send(new AppError(400, 'Validation Failed', [

                    new ValidationError('Invalid', 'destination', 
                        'Destination must be a string')
                        
                ], 'Invalid or missing properties'));
            }
            // If the destination url doesn't include a protocol, then add the http:// protocol by default:
            if (!(destination.startsWith('http://') || destination.startsWith('https://'))) {
                destination = 'http://' + destination;
            }
            // Validate destination as containing a valid URL:
            if (!validURL(destination)) {
                // Send 400 error if not valid URL:
                return res.status(400).send(new AppError(400, 'Validation Failed', [
                    new ValidationError('Invalid', 'destination', 
                        'Destination must be a valid URL')
                ], 'Invalid or missing properties'));
            }
        }

        // If the shortID property was provided, run validation checks.
        // Make sure the new shortID is unique and includes only url safe characters:
        if (shortID) {
            // Check if the shortID already exists:
            if (await ShortLink.findByShortID(shortID)) {
                return res.status(400).send(new AppError(400, "Bad Request", [

                    new ValidationError("Invalid", "shortID", "Custom shortID is unavaliable")

                ], "Invalid or missing values")); // Return 400 error.
            }
            // Check if shortID contains characters not safe for url:
            if (!validShortID(shortID)) {
                return res.status(400).send(new AppError(400, "Validation Failed", [

                    new ValidationError("Invalid", "shortID", 
                    "ShortID contains invalid characters (Acceptable characters:" 
                        + "a-z, A-Z, 0-9, dashes, and underscores).")

                ], "Invalid or missing values")); // Return 400 error.
            }
        }

        /**
         * Put properties into a data object so we can easily update    
         * in one go, and so we can set any undefined properties to
         * their current value.
         */
        const newData = {
            name: name || shortLink.name,
            shortID: shortID || shortLink.shortID,
            destination: destination || shortLink.destination
        };

        // Update and save the shortLink:
        shortLink.set(newData).save();

        // Format and return shortlink object response:
        return res.status(200)
                  .set('Location', `api/shortlinks/${shortLink.shortID}`)
                  .send(shortLink.getAPIResponse());
    } catch (error) {
        // console.log(error);
        return res.status(500).send(new AppError(500, 'Something went wrong :('));
    }
}


/**
 * Removes a shortlink with the specified shortID
 * @route (DELETE) api/shortlinks/{shortID}
 */
 export async function removeLink(req: express.Request, res: express.Response) {
    try { 
        // Find shortlink object & DELETE it if it exists:
        ShortLink.findOneAndDelete({shortID: req.params.shortID}, (err, link) => {
            // If the shortlink doesn't exist, we return a 404 error because nothing was found or deleted:
            if (!link) {
                return res.status(404).send(new AppError(404, 'Not Found', undefined,
                    'No shortink was found for the requested shortID'));
            }
    
            return res.status(204).send(); // Successfully deleted (No Content).
        });
    } catch (error) {
        // console.log(error);
        return res.status(500).send(new AppError(500, 'Something went wrong :('));
    }
}


// /**
//  * @route () api/shortlinks
//  */
//  export async function name(req: express.Request, res: Express.eesponse) {
    
// }
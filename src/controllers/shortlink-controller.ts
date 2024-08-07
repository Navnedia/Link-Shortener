import { Request, Response } from "express";
import { nanoid } from 'nanoid';

import AppError from '../utils/appError.js';
import ValidationError from '../utils/validationError.js';
import {validURL, stringNotEmpty, validShortID} from '../utils/validators.js';
import {ShortLink, IShortLinkAPIResponse, IShortLink} from '../models/ShortLink.js';
import { checkURL } from "../utils/urlScan.js";


/**
 * Create a new shortlink
 * @route (POST) api/shortlinks
 */
export async function createOneLink(req: Request, res: Response) {
    try {
        // Create new shortlink with helper method and get response:
        const helperResponse = await createLink(req.body, req.user);

        if (helperResponse instanceof AppError) { // If response is error send error body:
            return res.status(helperResponse.statusCode).send(helperResponse);
        }

        // Format and return shortlink object response:
        return res.status(200)
                  .set('Location', `api/shortlinks/${(helperResponse as IShortLinkAPIResponse).shortID}`)
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
 export async function createBulkLinks(req: Request, res: Response) {
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
        for (const linkData of requestBody) {
            const helperResponse = await createLink(linkData, req.user); // Attempt to create the new link.
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
 export async function createLink(linkData: IShortLink, userID): Promise<object | AppError> {
    try {
        // Pull parameters the user is allowed to set:
        const name = stringNotEmpty(linkData.name) 
            ? linkData.name : undefined; // Should this be a default name?
        var {destination} = linkData;
            
        /**
         * ! Validation will be refactored later to make it
         * ! more clean, reusable, and informative to the end user.
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
        if (!(/^(https?:\/\/)/.test(destination))) {
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


        // Generate a unique shortID that hasn't already been assigned:
        //! Temporary solution, might extract out.
        var shortID;
        while (true) {
            shortID = nanoid(7);
            if (!(await ShortLink.findByShortID(shortID))) break;
        }

        // Put properties into a data object and link to user:
         const data = {
            name: name,
            shortID: shortID,
            destination: destination,
            user: userID
        };

        // Create the new shortLink.
        const shortLink = await ShortLink.create(data);
        checkURL(shortLink); // Scan URL to check for malicious or suspicious links.        

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
 export async function getAllLinks(req: Request, res: Response) {
    try {
        const links = await ShortLink.find({user: req.user}); // Get all shortlinks for the user.
        // Format each object into a clean API response with only the necessary details.
        const linkResponses = links.map((link) => link.getAPIResponse());
        return res.status(200).send(linkResponses); // Return formated shortlink objects.
    } catch (error) {
        // console.log(error);
        return res.status(500).send(new AppError(500, 'Something went wrong :('));
    }
}


/**
 * Returns a shortlink with the specified shortID
 * @route (GET) api/shortlinks/{shortID}
 */
 export async function getOneLink(req: Request, res: Response) {
    try { 
        const link = await ShortLink.findOne({ user: req.user, shortID: req.params.shortID }).exec(); // Get shortlink object for shortID.
        // If the shortlink doesn't exist or if the user isn't the owner, we return an error:
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
 * Updates an existing shortlinks with the specified shortID
 * @route (PATCH) api/shortlinks/{shortID}
 */
 export async function updateLink(req: Request, res: Response) {
    try {
        // Make sure the requested shortlink exists first.
        const shortLink = await ShortLink.findOne({ user: req.user, shortID: req.params.shortID }).exec(); // Get shortlink by shortID.
        if (!shortLink) { // If we don't have a matching shortlink then we return a 404 error.
            return res.status(404).send(new AppError(404, 'Not Found', undefined,
                'No shortink was found for the requested shortID'));
        } else if (shortLink.isBlocked) { // Block ALL updates to link that have been flagged as bad.
            return res.status(500).send(new AppError(405, 'Method Not Allowed', undefined,
                `Could not perform update operation at this time: This link was flagged as potentially
                 malicious. If you think this is a mistake, reach out to us at appeals@minil.app`));
        }

        // Pull parameters the user is allowed to set:
        const name = stringNotEmpty(req.body.name) 
            ? req.body.name : undefined; // Get name from body if it exists.
        const shortID = stringNotEmpty(req.body.shortID) 
            ? req.body.shortID : undefined; // Get shortID from body if it exists.
        var destination = stringNotEmpty(req.body.destination) 
            ? req.body.destination : undefined; // Get destination from body if it exists.
        //! Is the string check here repetitive. How can I improve this, or do I need to wait for validation?

        /**
         * ! Validation will be refactored later to make it
         * ! more clean, reusable, and informative to the end user.
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
            if (!(/^(https?:\/\/)/.test(destination))) {
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

                    new ValidationError("Invalid", "shortID", "Custom shortID is unavailable")

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
        // If the destination url was changed, then Scan URL to check for malicious or suspicious links.
        if (destination) { 
            checkURL(shortLink); 
        }

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
 export async function removeLink(req: Request, res: Response) {
    ShortLink.findOneAndDelete({ user: req.user, shortID: req.params.shortID })
        .then((link) => {
            if (!link) {
                // If the shortlink doesn't exist, we return a 404 error because nothing was found or deleted:
                return res.status(404).send(new AppError(404, 'Not Found', undefined,
                    'No shortink was found for the requested shortID'));
            }

            return res.status(204).send(); // Successfully deleted (No Content).
        }).catch((err) => {
            // console.log(error);
            return res.status(500).send(new AppError(500, 'Something went wrong :('));
        });
}


// /**
//  * Function Template
//  * @route () api/shortlinks
//  */
//  export async function name(req: Request, res: Response) {
    
// }
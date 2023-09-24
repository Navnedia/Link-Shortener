import { URLSearchParams } from "url";
import fetch from "node-fetch";

import AppError from '../utils/appError.js';
import { IShortLink, ShortLink} from '../models/ShortLink.js';

const SCAN_URL = 'https://www.virustotal.com/api/v3/urls';
const CHECK_INTERVAL = 20000; // 20 seconds between each check.
const CHECK_MAX_ATTEMPTS = 3;


/**
 * Scan URL to check for malicious or suspicious links.
 * @param shortLink data for the ShortLink object.
 */
export async function checkURL(shortLink: IShortLink) {
    if (process.env.VIRUSTOTAL_APIKEY) {
        const encodedParams = new URLSearchParams();
        encodedParams.set('url', shortLink.destination);
        const postOptions = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'x-apikey': process.env.VIRUSTOTAL_APIKEY || '',
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: encodedParams
        };

        try {
            const scanRes = await fetch(SCAN_URL, postOptions);

            if (scanRes.ok) {
                const scan: any = await scanRes.json();
                const scanPassed = await getResults(scan);
                
                if (!scanPassed) {
                    setBlocked(shortLink);
                }
            } else {
                throw new AppError(500, 'URL scan request failed.');
            }
        } catch (err) {
            console.error(err);
        }
    }
}

/**
 * Waits to query the analysis results endpoint on an interval to give it time to
 * process and reduce API calls. Will attempt to retrive the result 
 * @param scan Response body from scan request. 
 * @returns If the scan passed (true), or if the link was flagged and failed (false).
 */
async function getResults(scan: any): Promise<Boolean> {
    let checks = 0;
    const getOptions = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-apikey': process.env.VIRUSTOTAL_APIKEY || ''
        }
    };

    return await new Promise((resolve, reject) => { // Using promise so we can wait for interval to finish and return.
        const checkResultsInterval = setInterval(async () => {
            try {
                const analysisResponse = await fetch(scan?.data?.links?.self, getOptions);
    
                if (analysisResponse.ok) {
                    const analysisResponseData: any = await analysisResponse.json();
    
                    const {status, stats} = analysisResponseData?.data?.attributes;
    
                    if (status == "completed") { // Check status is "completed," otherwise keep waiting and check again.
                        clearInterval(checkResultsInterval);
                        resolve(!(stats?.malicious > 0 || stats?.suspicious > 0)); // Return if the test passed (true) or failed (false).
                    }
                }  else {
                    throw new AppError(500, 'URL scan results check failed.');
                }
    
                if (++checks >= CHECK_MAX_ATTEMPTS) { // Terminate when the max attempts is reached.
                    throw new AppError(500, 'URL scan results check failed. Reached max attempts.');
                }
            } catch (err) {
                clearInterval(checkResultsInterval);
                reject(err);
            }
        }, CHECK_INTERVAL);
    });
}


/**
 * Sets isBlocked attribute to true to stop link from working.
 * @param link ShortLink Object.
 */
async function setBlocked(link) {
    await ShortLink.findOneAndUpdate(
        { _id: link.id }, // Look up with object ID to prevent user from changing shortID to get around block.
        { isBlocked: true });
}

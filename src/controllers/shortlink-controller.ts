import express from 'express';
import AppError from '../utils/appError.js';

/**
 * @route (POST) api/shortlinks
 */
export async function createLink(req: express.Request, res: express.Response) {
    res.status(501).send(new AppError(501, 'Not Implemented', undefined, 
        `(POST) ${req.baseUrl + req.path} has not been implemented`));
}

// /**
//  * @route () api/shortlinks
//  */
//  export async function name(req: Express.Request, res: Express.Response) {
    
// }
import { Request, Response, NextFunction } from "express";
import { healthCheck } from "../routes/api/index.js";

// When the application is not working like when the database is disconnected, we need to handle here because endpoints won't work.
export function errorHandler(error, req: Request, res: Response, next: NextFunction) {
    if (req.url == '/api/healthcheck') { // If trying to access the health check then just bypass the endpoint.
        healthCheck(req, res); // There might be a chance this could cause an error loop.
    } else {
        return res.status(500).send({
            statusCode: 500,
            message: 'Internal Server Error',
            description: 'Something went wrong. Please come back later! :('
        });
    }
}

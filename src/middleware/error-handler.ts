import { Request, Response, NextFunction } from "express";

//! Is this needed?
export const errorHandler = (error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    // console.log(error.stack!);
    // console.log("\n" + JSON.stringify(error, null, "\t"));
    
    // Should I return?
    return res.status(statusCode).send(JSON.stringify(error));
};
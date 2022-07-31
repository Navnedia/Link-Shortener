export const errorHandler = (error, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    // console.log(error.stack!);
    // console.log("\n" + JSON.stringify(error, null, "\t"));
    
    // Should I return?
    res.status(statusCode).send(JSON.stringify(error));
};
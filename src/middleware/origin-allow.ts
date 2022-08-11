export const originAllowHeader = (req, res, next) => {
    res.set("Access-Control-Allow-Origin", "*");
    next();
}
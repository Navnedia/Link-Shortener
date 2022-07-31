import ValidationError from "./validationError.js";

export default class AppError extends Error {

    /**
     * The status code of the request. For example, 400 when 
     * we recive a bad request that fails validation.
     */
    public statusCode: number;

    /**
     * An array of error objects to give additional information
     * about the types and locations of errors when nessessary.
     */
    public errors?: Error[];

    /**
     * More detail about the overall error.
     */
    public description?: string;

    constructor(statusCode: number, message: string, errors?: Error[], description?: string) {
        super(message); // Contains a short explanation of the reason for failing.
        
        this.statusCode = statusCode;
        this.errors = errors;
        this.description = description
    }

    // This allows us to stringify the error to Json and leave out undefined properties:
    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            errors: this.errors,
            description: this.description
        };
    }
}

// try {
//     let errors: ValidationError[] = [];
//     errors.push(new ValidationError("Invalid", "shortID already exists", "shortID"));
//     errors.push(new ValidationError("Missing", "destination cannot be blank", "destination"));

//     throw new AppError(400, "Validation Failed", errors, "Invalid or missing properties");
// } catch (error) {
//     console.log(JSON.stringify(error, null, "\t"));
// }

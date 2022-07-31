export default class ValidationError extends Error {

    /**
     * Generic code explaining what is wrong. For example,
     * Missing, or Invalid.
     */
    public code: string;

    /**
     * The JSON field name the error applies to.
     */
    public field: string;

    constructor(code: string, message: string, field: string) {
        // Contains a quick message detailing what is wrong with this input field.
        // Useful for displaying errors on front end.
        super(message); 
        
        this.code = code;
        this.field = field;
    }
    
    toJSON() {
        return {
            code: this.code,
            field: this.field,
            message: this.message
        };
    }
}
import config from "../configs/config.json" assert {type: 'json'};
        
// Separate all the values into individual variables:
let {
    DEFAULT_NAME,
    GENERAL_ERROR,
    VALIDATION_ERROR_MSG,
    BAD_URL_MSG,
    BAD_SHORTID_MSG,
    SHORTID_CHANGE_WARNING,
    EDIT_SUCCESS_MSG,
    UNAVAILABLE_RESPONSE
} = config;

// Export individual variables:
export {
    DEFAULT_NAME,
    GENERAL_ERROR,
    VALIDATION_ERROR_MSG,
    BAD_URL_MSG,
    BAD_SHORTID_MSG,
    SHORTID_CHANGE_WARNING,
    EDIT_SUCCESS_MSG,
    UNAVAILABLE_RESPONSE
};
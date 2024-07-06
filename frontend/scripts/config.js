import config from "../configs/config.json" with {type: 'json'};

// Export variables separately:
export const {
    DEFAULT_NAME,
    GENERAL_ERROR,
    VALIDATION_ERROR_MSG,
    BAD_URL_MSG,
    BAD_SHORTID_MSG,
    SHORTID_CHANGE_WARNING,
    EDIT_SUCCESS_MSG,
    UNAVAILABLE_RESPONSE
} = config;

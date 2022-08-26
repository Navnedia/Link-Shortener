import general from "../configs/general.json" assert {type: 'json'};
import dev from "../configs/dev.json" assert {type: 'json'};
import prod from "../configs/prod.json" assert {type: 'json'};

let config = {};

switch (window.location.hostname) {
    case "127.0.0.1":
    case "localhost":
        // Development local hostname.
        config = {...general, ...dev}; // Combine config info.
        break;
    default:
        // Default is production because I don't know the for sure production hostname yet.
        config = {...general, ...prod}; // Combine config info.
        break;
}

// Seperate all the values into indivisual variables:
let {
    API_URL, 
    REDIRECT_URL, 
    DEFAULT_NAME,
    GENERAL_ERROR,
    VALIDATION_ERROR_MSG,
    BAD_URL_MSG,
    BAD_SHORTID_MSG,
    SHORTID_CHANGE_WARNING,
    EDIT_SUCCESS_MSG,
    UNAVALIABLE_RESPONSE
} = config;

// Export indivisual variables:
export {
    API_URL, 
    REDIRECT_URL, 
    DEFAULT_NAME,
    GENERAL_ERROR,
    VALIDATION_ERROR_MSG,
    BAD_URL_MSG,
    BAD_SHORTID_MSG,
    SHORTID_CHANGE_WARNING,
    EDIT_SUCCESS_MSG,
    UNAVALIABLE_RESPONSE
};
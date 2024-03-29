import {BAD_URL_MSG, GENERAL_ERROR} from "./config.js";
import {createLink, getAllLinks} from "./api.js";
import {validURL} from "./client-validators.js";

const linkContainer = document.getElementById('linksContainer');
const longURL = document.getElementById('txtLongUrl');
const linkName = document.getElementById('txtLinkName');
const shortenBtn = document.getElementById('btnShorten');
const creationError = document.getElementById('creationError');

document.addEventListener('DOMContentLoaded', renderLinks);
shortenBtn.addEventListener('click', addNewLink);


async function renderLinks() {
    //! Maybe add an error message if the request fails, or a generic message if the user has no links.
    //! Should I be doing any kind of validation here to make sure the response matches a format?    
    let links = await getAllLinks(); // Request all the links.
    document.querySelector('.loader').classList.add('hidden'); // Remove loader.
    if (Array.isArray(links)) { // Display each link in the response array:
        links.forEach((linkData) => displayLinkItem(linkData));
    }
}


async function addNewLink() {
    const data = {};
    data['destination'] = longURL.value.trim() || null; 
    data['name'] = linkName.value.trim() || null;

    // Check if the new destination is not null and is a valid URL:
    if (typeof data.destination === 'string' && validURL(data.destination)) {
        // If the url doesn't include a protocol, then add the http:// protocol by default:
        if (!(/^(https?:\/\/)/.test(data.destination))) {
            data.destination = 'http://' + data.destination;
        }
    } else { // Set an invalid error if destination is blank or not a url:
        longURL.classList.add('invalid'); // Set URL field invalid.
        setCreationError(true, BAD_URL_MSG); // Show error.
        return;
    }
    
    shortenBtn.classList.add('loading'); // Add button loader style.
    setCreationError(false); // Hide creation error because it passed validation. 
    longURL.classList.remove('invalid'); // Remove URL field invalid because it passed validation checks.
    
    const linkRes = await createLink(data); // Send create request.
    //! Add better handling for errors returned from backend server.
    // If non-empty data was received, create and display the element:
    if (Object.keys(linkRes).length !== 0 && !linkRes.statusCode) {
        displayLinkItem(linkRes);
        
        // Scroll to the top to show the new link:
        window.scroll({top: 0, behavior: 'smooth'});
        
        // Clear input fields only if a link was created.
        longURL.value = '';
        linkName.value = '';
    } else {
        setCreationError(true, linkRes.description, 10000); // Show error.
    }
    
    shortenBtn.classList.remove('loading'); // Remove button loader style.
}

/**
 * Creates a link item component with the data and adds it to the DOM.
 * @param {object} linkData - The link data for the item.
 */
function displayLinkItem(linkData) {
    let linkItem = document.createElement('link-item');
    linkItem.setData(linkData);
    linkContainer.prepend(linkItem);
}

/**
 * Set the state and content of the creation error message.
 * @param {boolean} shown - Dictates if the error box should be shown, or hidden.
 * @param {string} msg - The message to be displayed (optional).
 * @param {integer} timeOut - The time in milliseconds that the message should last (optional).
 */
async function setCreationError(shown, msg, timeOut) {
    if (shown) {
        creationError.querySelector('#creationErrorMsg').innerHTML = msg || GENERAL_ERROR;
        creationError.classList.remove('hidden');

        if (!!timeOut) {
            setTimeout(async () => {
                creationError.classList.add('hidden');
            }, timeOut);
        }
    } else {
        creationError.classList.add('hidden');
    }
}
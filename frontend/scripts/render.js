import {createLink, getAllLinks} from "./api.js";
import {validURL} from "./client-validators.js";

const linkContainer = document.getElementById('linksContainer');
const longURL = document.getElementById('txtLongUrl');
const linkName = document.getElementById('txtLinkName');
const shortenBtn = document.getElementById('btnShorten');
const creationError = document.getElementById('creationError');

const BAD_URL_MSG = 'Please enter a valid URL. For example, "https://example.com/videos".';
const REQUEST_FAIL_MSG = 'Something went wrong.';

document.addEventListener('DOMContentLoaded', renderLinks);
shortenBtn.addEventListener('click', addNewLink);


async function renderLinks() {
    var links = await getAllLinks(); // Request all the links.

    //! I should show something diffrent if the links are empty or if a backend error occurs.
    //! Should I be doing any kind of validation here?

    if (Array.isArray(links)) { 
        // Display each link in the response array:
        links.forEach((linkData) => displayLinkItem(linkData));
    }
}


async function addNewLink() {
    const data = {};
    data['destination'] = longURL.value.trim() || null; 
    data['name'] = linkName.value.trim() || null;
    
    //! Add form validation.
    //! Better handle errors returned form server.

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
    // If non-empty data was recived, create and display the element:
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
    const linkItem = document.createElement('link-item');
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
        creationError.querySelector('#creationErrorMsg').innerHTML = msg || REQUEST_FAIL_MSG;
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

// // Real time url validation:
// document.getElementById('txtLongUrl').addEventListener('input', (e) => {
//     const element = e.target;
//     (!validURL(element.value)) ? element.classList.add('invalid') 
//         : element.classList.remove('invalid');
// });
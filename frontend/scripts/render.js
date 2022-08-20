import {createLink, getAllLinks} from "./api.js";
import {validURL} from "./client-validators.js";

const linkContainer = document.getElementById('linksContainer');
const longURL = document.getElementById('txtLongUrl');
const linkName = document.getElementById('txtLinkName');
const shortenBtn = document.getElementById('btnShorten');
const creationError = document.querySelector('.creationError');

const BAD_URL_MSG = 'Please enter a valid URL. For example, "https://example.com/food".';
const REQUEST_FAIL_MSG = 'Something went wrong.';


document.addEventListener('DOMContentLoaded', renderLinks);
shortenBtn.addEventListener('click', addLink);


async function renderLinks() {
    var links = await getAllLinks(); // Request all the links.

    //! I should show something diffrent if the links are empty or if a backend error occurs.
    //! Should I be doing any kind of validation here?

    if (Array.isArray(links)) { 
        // Display each link in the response array:
        for (const linkData of links) {
            const linkItem = document.createElement('link-item');
            linkItem.setData(linkData);
            linkContainer.prepend(linkItem);
        }
    }
}

async function addLink() {
    const data = {};
    data['destination'] = longURL.value.trim() || null; 
    data['name'] = linkName.value.trim() || null;
    
    //! Add form validation.
    //! Better handle errors returned form server.
    
    if (!data.destination || typeof data.destination !== 'string') {
        longURL.classList.add('invalid'); // Set URL field invalid.
        setCreationError(true, BAD_URL_MSG); // Show error.
        return;
    }
    // If the destination url doesn't include a protocol, then add the http:// protocol by default:
    if (!(/^(https?:\/\/)/.test(data.destination))) {
        data.destination = 'http://' + data.destination;
    }
    if (!validURL(data.destination)) {
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
        const linkItem = document.createElement('link-item');
        linkItem.setData(linkRes);
        linkContainer.prepend(linkItem);
        
        // Scroll to the top to show the new link:
        window.scroll({top: 0, behavior: 'smooth'});
        
        // Clear input fields only if a link was created.
        longURL.value = '';
        linkName.value = '';
    } else {
        setCreationError(true, linkRes.description); // Show error.
    }
    
    shortenBtn.classList.remove('loading'); // Remove button loader style.
}

/**
 * Set the state and content of the creation error message.
 * @param {boolean} shown - Dictates if the error box should be shown, or hidden.
 * @param {string} msg - The message to be displayed (optional).
 */
async function setCreationError(shown, msg) {
    if (shown) {
        creationError.querySelector('#creationErrorMsg').innerHTML = msg || REQUEST_FAIL_MSG;
        creationError.classList.remove('hidden');
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
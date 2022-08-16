import {createLink, getAllLinks} from "./api.js";
import {validURL} from "./client-validators.js";

const linkContainer = document.getElementById('linksContainer');
const longURL = document.getElementById('txtLongUrl');
const linkName = document.getElementById('txtLinkName');
const shortenBtn = document.getElementById('btnShorten');


document.addEventListener('DOMContentLoaded', async () => {
    var links = await getAllLinks(); // Request all the links.

    //! I should show something diffrent if the links are empty or if a backend error occurs.
    //! should I be doing any kind of validation here?

    if (Array.isArray(links)) { 
        // Display each link in the response array:
        for (const linkData of links) {
            const linkItem = document.createElement('link-item');
            linkItem.setData(linkData);
            linkContainer.prepend(linkItem);
        }
    }
});

// // Real time url validation:
// document.getElementById('txtLongUrl').addEventListener('input', (e) => {
//     const element = e.target;
//     (!validURL(element.value)) ? element.classList.add('invalid') 
//         : element.classList.remove('invalid');
// });


shortenBtn.addEventListener('click', addLink);

async function addLink() {
    const data = {};
    data['destination'] = longURL.value.trim() || null; 
    data['name'] = linkName.value.trim() || null;

    //! Add form validation.
    //! Handle returned errors.

    if (!data.destination) {
        return;
    }
    // If the destination url doesn't include a protocol, then add the http:// protocol by default:
    if (!(/^(https?:\/\/)/.test(data.destination))) {
        data.destination = 'http://' + data.destination;
    }
    if (!validURL(data.destination)) {
        return;
    }

    shortenBtn.classList.add('loading'); // Add button loader style.

    const linkRes = await createLink(data); // Send create request.
    if (Object.keys(linkRes).length !== 0) { // If non-empty data was recived, create and display the element:
        const linkItem = document.createElement('link-item');
        linkItem.setData(linkRes);
        linkContainer.prepend(linkItem);

        // Scroll to the top to show the new link:
        window.scroll({top: 0, behavior: 'smooth'});

        // Clear input fields only if a link was created.
        longURL.value = '';
        linkName.value = '';
    }

    shortenBtn.classList.remove('loading'); // Remove button loader style.
}
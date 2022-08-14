import {createLink, getAllLinks} from "./api.js";
import {validURL} from "./client-validators.js";

const linkContainer = document.getElementById('linksContainer');
const createBtn = document.getElementById('btnCreate');


document.addEventListener('DOMContentLoaded', async () => {
    var links = await getAllLinks();

    //! I should show something diffrent if the links are empty or if a backend error occurs.
    //! should I be doing any kind of validation here?

    if (Array.isArray(links)) {
        for (const linkData of links) {
            const linkItem = document.createElement('link-item');
            linkItem.setData(linkData);
            
            linkContainer.prepend(linkItem);
        }
    }
});

// Real time url validation:
document.getElementById('txtLongUrl').addEventListener('input', (e) => {
    const element = e.target;
    (!validURL(element.value)) ? element.classList.add('invalid') 
        : element.classList.remove('invalid');
});


createBtn.addEventListener('click', addLink);

async function addLink() {
    const data = {};
    data['destination'] = document.getElementById('txtLongUrl').value.trim() || null; 
    data['name'] = document.getElementById('txtLinkName').value.trim() || null;

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

    const linkRes = await createLink(data);

    if (linkRes) {
        const linkItem = document.createElement('link-item');
        linkItem.setData(linkRes);
        linkContainer.prepend(linkItem);
    }
}
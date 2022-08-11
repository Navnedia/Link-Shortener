import {createLink, getAllLinks} from "./api.js";

const linkContainer = document.getElementById('linksContainer');


document.addEventListener('DOMContentLoaded', async () => {
    var links = await getAllLinks();

    //! I should show something diffrent if the links are empty or if a backend error occurs.
    //! should I be doing any kind of validation here?
    if (Array.isArray(links)) {
        for (const linkData of links) {
            const linkItem = document.createElement('link-item');
            linkItem.setData(linkData);
            
            linkContainer.appendChild(linkItem);
        }
    }
});
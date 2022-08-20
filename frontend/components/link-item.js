import {removeLink} from "../scripts/api.js";

class LinkItem extends HTMLElement {
    constructor() {
        super();
        
        this.name = "";
        this.shortID = "";
        this.destination = "";
        this.link = "";
        this.clicks = 0;
        this.created = "";
        this.attachShadow({mode: 'open'}); // Create shadow root.
    }

    setData(properties) {
        this.name = properties.name || "Untitled";
        this.shortID = properties.shortID || "";
        this.destination = properties.destination || " ";
        this.link = properties.link || " ";
        this.clicks = properties.clicks || "0";
        this.created = (new Date(properties.created).toString() !== "Invalid Date") 
            ? new Date(properties.created).toLocaleDateString() : " ";
        // Format date consistent length with a staic helper method?
    }

    connectedCallback() {
        const linkItemTemplate = document.createElement('template');
        linkItemTemplate.innerHTML = `
            <link rel="stylesheet" href="./styles/shortlink-card.css">
            <link rel="stylesheet" href="./styles/utils.css">
            <link rel="stylesheet" href="./styles/icons.css">

            <div class="link-item">
                <span class="created-date">${this.created}</span>
                <h2 class="link-title ellipsis" tabindex="0">${this.name ?? "Untitled"}</h2>
            
                <span class="destination link">
                    <a href="${this.destination}" target="_blank" class="ellipsis">${this.destination}</a>
                </span>
            
                <hr>
            
                <span class="shortlink link">
                    <a href="${this.link}" target="_blank" class="ellipsis">${this.link}</a>
                </span>
                <span class="clicks">${this.clicks} Clicks</span>
            
                <div class="item-action-buttons">
                    <button id="btnCopy" type="button" class="action-btn" tooltip="Copy">
                        <i class="fa-regular fa-clipboard"></i>
                    </button>
                    <button id="btnShare" type="button" class="action-btn" tooltip="Share">
                        <i class="fa-solid fa-share"></i>
                    </button>
                    <button id="btnQRCode" type="button" class="action-btn" tooltip="QRCode">
                        <i class="fa-solid fa-qrcode"></i>
                    </button>
                    <button id="btnEdit" type="button" class="action-btn" tooltip="Edit">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button id="btnDel" type="button" class="action-btn" tooltip="Delete">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div> <!-- End of action buttons -->

                <div class="warning-container flex-center flex-column hidden">
                    <span class="confirm-message">Are you sure you want to delete this link?</span>
                    <div class="confirm-buttons">
                        <button type="button" id="btnConfirmCancel">Cancel</button>
                        <button type="button" id="btnConfirmDelete">Delete</button>
                    </div>

                    <span class="delete-error-message hidden"></span>
                </div> <!-- End of warning container -->
            </div> <!-- End of link-item -->`;
        this.shadowRoot.appendChild(linkItemTemplate.content); // Add content to shadow.

        // Attach event listeners:

        this.shadowRoot.getElementById('btnCopy') // Add copy button listener.
            .addEventListener('click', this.copyLinkToClipboard.bind(this));

        // Add listener to both the delete and cancel confirmation button:
        this.shadowRoot.querySelectorAll('#btnDel, #btnConfirmCancel').forEach((e) => {
            e.addEventListener('click', () => {
                // Hide error field from any previous failed runs:
                this.shadowRoot.querySelector('.delete-error-message').classList.add('hidden');
                // Show delete confirmation:
                this.shadowRoot.querySelector('.warning-container').classList.toggle('hidden');
            });
        });

        this.shadowRoot.getElementById('btnConfirmDelete') // Add Listener to fully delete link.
            .addEventListener('click', this.deleteShortLink.bind(this));
    }

    // updateContent() {
    //     this.shadowRoot.innerHTML = `
    //         <link rel="stylesheet" href="./styles/shortlink-card.css">
    //         <link rel="stylesheet" href="./styles/utils.css">
    //         <link rel="stylesheet" href="./styles/icons.css">

    //         <div class="link-item">
    //             <span class="created-date">${this.created}</span>
    //             <h2 class="link-title ellipsis" tabindex="0">${this.name ?? "Untitled"}</h2>
            
    //             <span class="destination link">
    //                 <a href="${this.destination}" target="_blank" class="ellipsis">${this.destination}</a>
    //             </span>
            
    //             <hr>
            
    //             <span class="shortlink link">
    //                 <a href="${this.link}" target="_blank" class="ellipsis">${this.link}</a>
    //             </span>
    //             <span class="clicks">${this.clicks} Clicks</span>
            
    //             <div class="item-action-buttons">
    //                 <button id="btnCopy" type="button" class="action-btn" tooltip="Copy">
    //                     <i class="fa-regular fa-clipboard"></i>
    //                 </button>
    //                 <button id="btnShare" type="button" class="action-btn" tooltip="Share">
    //                     <i class="fa-solid fa-share"></i>
    //                 </button>
    //                 <button id="btnQRCode" type="button" class="action-btn" tooltip="QRCode">
    //                     <i class="fa-solid fa-qrcode"></i>
    //                 </button>
    //                 <button id="btnEdit" type="button" class="action-btn" tooltip="Edit">
    //                     <i class="fa-solid fa-pencil"></i>
    //                 </button>
    //                 <button id="btnDel" type="button" class="action-btn" tooltip="Delete">
    //                     <i class="fa-solid fa-trash-can"></i>
    //                 </button>
    //             </div> <!-- End of action buttons -->

    //             <div class="warning-container flex-center flex-column hidden">
    //                 <span class="confirm-message">Are you sure you want to delete this link?</span>
    //                 <div class="confirm-buttons">
    //                     <button type="button" id="btnConfirmCancel">Cancel</button>
    //                     <button type="button" id="btnConfirmDelete">Delete</button>
    //                 </div>

    //                 <span class="delete-error-message hidden"></span>
    //             </div> <!-- End of warning container -->
    //         </div> <!-- End of link-item -->`;
    // }

    disconnectedCallback() {
        
    }

    /* Methods below must be avalible if you want to be able to update links
       after creation without just deleting the card and readding it. */

    attributeChangedCallback(name, oldValue, newValue) {
        // console.log(`${this.getAttribute(name)}, ${this[name]}`);

        /* You would need to indivisually update properties here using the DOM
           with things like queryselector */
        // this.updateContent();
    }


    // Button listeners:
    copyLinkToClipboard() {
        navigator.clipboard.writeText(this.link); // Copy link to clipboard.
        // Update to tool tip to show the link has been copied:
        const copyBtn = this.shadowRoot.getElementById('btnCopy');
        copyBtn.setAttribute('toolTip', 'Copied');
        setTimeout(() => { // After a delay change the tool tip text back to copy.
            copyBtn.setAttribute('toolTip', 'Copy');
        }, 2500);
    }

    async deleteShortLink() {
        /**
         * In theory, if the user hits this event listener this means
         * they needed to confirm their decision to delete. Unless of
         * course they were messing around with the html.
         */
        let errorField = this.shadowRoot.querySelector('.delete-error-message');
        let delBtn = this.shadowRoot.getElementById('btnConfirmDelete');
        errorField.classList.add('hidden'); // Hide error fields from previous runs.

        delBtn.classList.add('loading'); // Add loading to delete button.
        const response = await removeLink(this.shortID); // Make request.
        delBtn.classList.remove('loading'); // Remove loading.

        // If the response isn't blank, then display the error & return:
        if (Object.keys(response).length !== 0) {
            errorField.innerHTML = response.description || 'Something went wrong';
            errorField.classList.remove('hidden');
            return;
        }

        // Set item opacity to zero and allow css to smoothly transition.
        this.shadowRoot.querySelector('.link-item').style.opacity = 0;
        
        // Wait for opacity transition to end before removing from DOM:
        setTimeout(() => {
            this.parentNode.removeChild(this);
        }, 500);
    }


    // Getter & Setter Methods: 
    get name() {
        return this.getAttribute('name');
    }

    set name(value) {
        if (value) {
            this.setAttribute('name', value);
        } else {
            this.removeAttribute('name');
        }
    }

    /* Because this is internal I don't really want to this to be visible
       or changeable externally. */
    // get shortID() {
    //     return this.getAttribute('shortID');
    // }

    // set shortID(value) {
    //     if (value) {
    //         this.setAttribute('shortID', value);
    //     } else {
    //         this.removeAttribute('shortID');
    //     }
    // }

    get destination() {
        return this.getAttribute('destination');
    }

    set destination(value) {
        if (value) {
            this.setAttribute('destination', value);
        } else {
            this.removeAttribute('destination');
        }
    }

    get link() {
        return this.getAttribute('link');
    }

    set link(value) {
        if (value) {
            this.setAttribute('link', value);
        } else {
            this.removeAttribute('link');
        }
    }

    get clicks() {
        return this.getAttribute('clicks');
    }

    set clicks(value) {
        if (value) {
            this.setAttribute('clicks', value);
        } else {
            this.removeAttribute('clicks');
        }
    }

    get created() {
        return this.getAttribute('created');
    }

    set created(value) {
        if (value) {
            this.setAttribute('created', value);
        } else {
            this.removeAttribute('created');
        }
    }


    // Initialize observed attributes:
    static get observedAttributes() {
        return ['name', 'shortID', 'destination', 'link', 'clicks', 'created'];
    }
}

customElements.define('link-item', LinkItem);
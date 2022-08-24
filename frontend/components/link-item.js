import {removeLink} from "../scripts/api.js";
import {openModal} from "../scripts/modal.js";

class LinkItem extends HTMLElement {
    constructor() {
        super();
        this.linkData = {};
        this.attachShadow({mode: 'open'}); // Create shadow root.
    }

    setData(data) {
        this.linkData = data || {};
    }

    updateDisplay(newData) {
        if (!newData || !(newData instanceof Object)) return;
        this.linkData = newData || {};
        this.renderUpdates();
    }


    connectedCallback() {
        this.render(); // Render HTML with values to the shadow DOM.
        this.attachListeners(); // Attach event listeners for buttons.
    }

    disconnectedCallback() {

    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="./styles/shortlink-card.css">
            <link rel="stylesheet" href="./styles/utils.css">
            <link rel="stylesheet" href="./styles/icons.css">

            <div class="link-item">
                <span class="created-date" aria-label="Date Created">${this.localDate(this.linkData.created)}</span>
                <h2 class="link-title ellipsis" tabindex="0" aria-label="Link Name">${this.linkData.name || 'Untitled'}</h2>
            
                <span class="destination link">
                    <a href="${this.linkData.destination || ' '}" target="_blank" class="ellipsis" aria-label="Long URL">${this.linkData.destination || ' '}</a>
                </span>
            
                <hr>
            
                <span class="shortlink link">
                    <a href="${this.linkData.link || ' '}" target="_blank" class="ellipsis" aria-label="Shortened Link">${this.linkData.link || ' '}</a>
                </span>
                <span class="clicks"><span id="linkClicks">${this.linkData.clicks || '0'}</span> Clicks</span>
            
                <div class="item-action-buttons">
                    <button id="btnCopy" type="button" class="action-btn" arial-label="Copy Link" tooltip="Copy">
                        <i class="fa-regular fa-clipboard" aria-hidden="true"></i>
                    </button>
                    <button id="btnShare" type="button" class="action-btn" aria-label="Share Link" tooltip="Share">
                        <i class="fa-solid fa-share" aria-hidden="true"></i>
                    </button>
                    <button id="btnQRCode" type="button" class="action-btn" aria-label="Generate QRCode" tooltip="QRCode">
                        <i class="fa-solid fa-qrcode" aria-hidden="true"></i>
                    </button>
                    <button id="btnEdit" type="button" class="action-btn" aria-label="Edit" tooltip="Edit">
                        <i class="fa-solid fa-pencil" aria-hidden="true"></i>
                    </button>
                    <button id="btnDel" type="button" class="action-btn" aria-label="Delete Link" tooltip="Delete">
                        <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                    </button>
                </div> <!-- End of action buttons -->

                <div class="message-container warning flex-center flex-column hidden">
                    <span class="confirm-message">Are you sure you want to delete this link?</span>
                    <div class="fancy-buttons">
                        <button type="button" id="btnDelCancel">Cancel</button>
                        <button type="button" id="btnConfirmDelete">Delete</button>
                    </div>

                    <span class="delete-error-message hidden"></span>
                </div> <!-- End of warning message container -->
            </div> <!-- End of link-item -->`;
    }

    attachListeners() {
        this.getEl('#btnCopy') // Add copy button listener.
            .addEventListener('click', this.copyLinkToClipboard.bind(this));

        // Add Edit button listener:
        this.getEl('#btnEdit').addEventListener('click', () => {
            /**
             * Open the edit modal with the link data, and attach the callback function 
             * to update this link item in the DOM.
             */
            openModal('edit-panel', this.linkData, this.updateDisplay.bind(this));
        });

        // Add listener to both the delete and cancel confirmation button:
        this.getElements('#btnDel, #btnDelCancel').forEach((e) => {
            e.addEventListener('click', () => {
                // Hide error field from any previous failed runs:
                this.getEl('.delete-error-message').classList.add('hidden');
                // Show delete confirmation:
                this.getEl('.message-container.warning').classList.toggle('hidden');
            });
        });

        this.getEl('#btnConfirmDelete') // Add Listener to fully delete link.
            .addEventListener('click', this.deleteShortLink.bind(this));
    }

    // Button listeners:
    copyLinkToClipboard() {
        navigator.clipboard.writeText(this.linkData.link); // Copy link to clipboard.
        // Update to tool tip to show the link has been copied:
        const copyBtn = this.getEl('#btnCopy');
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
        const errorField = this.getEl('.delete-error-message');
        const delConfirmBtn = this.getEl('#btnConfirmDelete');
        errorField.classList.add('hidden'); // Hide error fields from previous runs.

        delConfirmBtn.classList.add('loading'); // Add loading to delete button.
        const response = await removeLink(this.linkData.shortID); // Make request.
        delConfirmBtn.classList.remove('loading'); // Remove loading.

        // If the response isn't blank, then display the error & return:
        if (Object.keys(response).length !== 0) {
            errorField.innerHTML = response.description || 'Something went wrong';
            errorField.classList.remove('hidden');
            return;
        }

        // Set item opacity to zero and allow css to smoothly transition.
        this.getEl('.link-item').style.opacity = 0;
        
        // Wait for opacity transition to end before removing from DOM:
        setTimeout(() => {
            this.parentNode.removeChild(this);
        }, 500);
    }


    // Helpers Functions:
    /**
     * Updates values in the shadow DOM to reflect current property values.
     */
    renderUpdates() {
        let destinationLink = this.getEl(".destination.link > a");
        destinationLink.href = this.linkData.destination || ' '; 
        destinationLink.innerHTML = this.linkData.destination || ' ';
        let shortLink = this.getEl(".shortlink.link > a");
        shortLink.href = this.linkData.link || ' '; 
        shortLink.innerHTML = this.linkData.link || ' ';

        this.getEl(".link-title").innerHTML = this.linkData.name || 'Untitled';
        this.getEl(".created-date").innerHTML = this.localDate(this.linkData.created);
        this.getEl("#linkClicks").innerHTML = this.linkData.clicks || '0';
    }

    /**
     * Converts a date string into the correct local time zone and date format.
     * @param {string} dateStr - A date string.
     * @returns The converted date String (in local).
     */
    localDate(dateStr) {
        const local = new Date(dateStr).toLocaleDateString();
        if (local === "Invalid Date") return "";
        return local;
    }

    /**
     * A simple helper method to simplify getting elements from shadow DOM.
     * @param {string} selctor - The query to select the desired element.
     * @returns The first element in the shadow DOM that matches selector.
     */
     getEl(selctor) {return this.shadowRoot.querySelector(selctor)}

     /**
     * A simple helper method to simplify getting all elements from shadow DOM
     * for a given query.
     * @param {string} selctors - The query to select the desired elements.
     * @returns All elements in the shadow DOM that matches selector.
     */
    getElements(selctors) {return this.shadowRoot.querySelectorAll(selctors)}
}

customElements.define('link-item', LinkItem);
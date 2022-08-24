import { updateLink } from "../scripts/api.js";
import {closeModal} from "../scripts/modal.js";

class editPanel extends HTMLElement {
    constructor() {
        super();
        this.linkData = {};
        this.callback = null;
        this.attachShadow({mode: 'open'}); // Create shadow root.
    }

    setData(linkData, callback) {
        this.linkData = linkData || {};
        this.callback = callback || null;
    }

    connectedCallback() {
        this.render(); // Render HTML with values to the shadow DOM.
        this.attachListeners(); // Attach event listeners for buttons.
    }

    disconnectedCallback() {

    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="./styles/edit-modal.css">
            <link rel="stylesheet" href="./styles/utils.css">
            <link rel="stylesheet" href="./styles/icons.css">

            <div class="modal-content flex-column">
            <header class="modal-header">
                <button type="button" id="btnCloseModal" aria-label="Close Edit Panel">
                    <i class="fa-solid fa-x fa-xl" aria-hidden="true"></i>
                </button>
                <h2 tabindex="0">Edit Panel</h2><hr>
            </header>

            <form id="editForm" class="flex-column">
                <div class="field-group flex-column">
                    <label for="txtName">Name</label>
                        <input type="text"
                            id="txtName" 
                            class="fancy-input" 
                            placeholder="Add a name" 
                            value="${this.linkData.name || 'Untitled'}">

                    <span id="nameErrorMsg" class="field-error ellipsis"></span>
                </div> <!-- End of name field group -->
                <div class="field-group flex-column">
                    <label for="txtDestination">Long URL</label>
                        <input type="text" 
                            id="txtDestination" 
                            maxlength="6144" 
                            class="fancy-input" 
                            placeholder="Add a destination URL"
                            value="${this.linkData.destination || ''}">

                    <span id="destinationErrorMsg" class="field-error ellipsis"></span>
                </div> <!-- End of destination url field group -->
                <div class="field-group flex-column">
                    <label for="txtShortName">URL Short ID</label>
                        <div class="shortID-bar">
                            <span id="baseUrl" class="input-addon prefix">${"!!!!!!!Domain Here!!!!!!"}</span>
                            <input type="text" 
                                id="txtShortName" 
                                class="fancy-input has-prefix" 
                                placeholder="Add a custom back-half" 
                                value="${this.linkData.shortID || ''}">
                        </div>

                    <div id="shortidErrorMsg" class="field-error ellipsis"></div>
                </div> <!-- End of shortID field group -->

                <div class="fancy-buttons flex-right">
                    <button type="button" id="btnEditCancel">Cancel</button>
                    <button type="button" id="btnEditSave">Update</button>
                </div> <!-- End edit panel control buttons container -->
            </form> <!-- End edit form -->
            
            <div id="editPanelMessage" class="message-container has-icon info hidden">
                <i class="fa-solid fa-circle-check hidden" aria-hidden="true"></i>
                <i class="fa-solid fa-circle-exclamation hidden" aria-hidden="true"></i>
                <span id="editMsg" aria-label="Edit Message"></span>
            </div> <!-- End of update messages (message-container) -->
        </div> <!-- End modal content -->`;
    }

    attachListeners() {
        // Add close model button listeners:
        this.getElements('#btnCloseModal, #btnEditCancel').forEach((e => {
            e.addEventListener('click', closeModal);
        }));

        // Add save button listener:
        this.getEl('#btnEditSave').addEventListener('click', this.saveChanges.bind(this));
    }

    // Event listeners:
    async saveChanges() {
        //! This is a bit of a hack around, I plan to make this nicer.

        const newName = this.getEl('#txtName').value.trim();
        const newDestination = this.getEl('#txtDestination').value.trim();
        const newShortID = this.getEl('#txtShortName').value.trim();

        const data = {
            name: (newName !== this.linkData.name) ? newName : null,
            destination: (newDestination !== this.linkData.destination) ? newDestination : null,
            shortID: (newShortID !== this.linkData.shortID) ? newShortID : null
        };

        const updatedLink = await updateLink(this.linkData.shortID, data);

        //! This is esspecially hacky, lol. Just trying want to get to bed for now.
        if (this.callback instanceof Function) {
            this.callback(updatedLink);
        }
    }

    // Helpers:
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

customElements.define('edit-panel', editPanel);
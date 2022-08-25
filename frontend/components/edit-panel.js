import {closeModal} from "../scripts/modal.js";
import {updateLink} from "../scripts/api.js";
import {validURL} from "../scripts/client-validators.js";

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
                            name="destination"
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
                                name="shortID" 
                                class="fancy-input has-prefix" 
                                placeholder="Add a custom back-half" 
                                value="${this.linkData.shortID || ''}">
                        </div>

                    <div id="shortIDErrorMsg" class="field-error ellipsis"></div>
                </div> <!-- End of shortID field group -->

                <div class="fancy-buttons flex-right">
                    <button type="button" id="btnEditCancel">Cancel</button>
                    <button type="button" id="btnEditSave">Update</button>
                </div> <!-- End edit panel control buttons container -->
            </form> <!-- End edit form -->`;
    }

    attachListeners() {
        // Add close model button listeners:
        this.addListenerAll('#btnCloseModal, #btnEditCancel', 'click', closeModal);
        this.addListenerAll('#txtDestination, #txtShortName', 'input', this.notEmpty.bind(this));

        // Add save button listener:
        this.getEl('#btnEditSave').addEventListener('click', this.saveChanges.bind(this));
    }

    // Event listeners:
    async saveChanges() {
        const newName = this.getEl('#txtName').value.trim();
        const newDestination = this.getEl('#txtDestination').value.trim();
        const newShortID = this.getEl('#txtShortName').value.trim();

        const data = {
            name: (newName !== this.linkData.name) ? newName : null,
            destination: (newDestination !== this.linkData.destination) ? newDestination : null,
            shortID: (newShortID !== this.linkData.shortID) ? newShortID : null
        };

        const updatedLink = await updateLink(this.linkData.shortID, data);
        
        if (this.callback instanceof Function) {
            this.callback(updatedLink);
        }
    }

    async notEmpty(event) {
        const element = event.target;
        if (element.value.length === 0) {
            this.getEl('#btnEditSave').setAttribute('disabled', ''); // Disable the update button.
            this.setInvalid(element, true, `The ${element.name} cannot be empty`); // Add invalid styles and Message.
        } else {
            this.getEl('#btnEditSave').removeAttribute('disabled'); // Enable the update button.
            this.setInvalid(element, false); // Remove invalid styles and Message.
        }
    }

    async checkURL(event) {
        console.log("Event");
        const element = event.target;
        (!validURL(element.value)) ? element.classList.add('invalid') 
            : element.classList.remove('invalid');
    }

    // Helpers:
    /**
     * This helper allows you to set a field input as invalid to add styles,
     * and define the error message. You can also use this to remove invalid
     * styles and message.
     * @param {*} field - The field element.
     * @param {boolean} isInvalid - The invalid state (default true for invalid).
     * @param {string} errorMsg - The error message to be displayed below the field.
     */
    async setInvalid(field = null, isInvalid = true, errorMsg = null) {
        try {
            if (isInvalid) {
                field.classList.add('invalid');
                this.getEl(`#${field.name}ErrorMsg`).innerHTML = errorMsg || `Invalid or missing ${field.name}`;
            } else {
                field.classList.remove('invalid');
                this.getEl(`#${field.name}ErrorMsg`).innerHTML = '';
            }
        } catch (e) {
            // console.error(e);
        }
    }

    /**
     * Helper to easily display and remove the edit message.
     * @param {boolean} isVisable - Defines if the message should be displayed or removed.
     * @param {boolean} isWarning - Defines if the message should be in a warning style or info style.
     * @param {string} message - Defines the message text content. 
     */
    async setEditMessage(isVisable = false, isWarning = true, message = null) {
        const modalContent = this.getEl('.modal-content');
        let editMsg = this.getEl('#editPanelMessage');
        if (!!editMsg) modalContent.removeChild(editMsg); // Remove existing message if applicable.

        if (isVisable) {
            const messageTemplate = document.createElement('template');
            messageTemplate.innerHTML = `
                <div id="editPanelMessage" class="message-container has-icon ${(isWarning) ? 'warning' : 'info'}">
                    <i class="fa-solid ${(isWarning) ? 'fa-circle-exclamation' : 'fa-circle-check'}" aria-hidden="true"></i>
                    <span id="editMsg" aria-label="Edit Message">${message || ((isWarning) ? 'Something went wrong' : 'All Set')}</span>
                    <!-- End of update messages (message-container) -->
                </div>`;
            modalContent.append(messageTemplate.content);
        }
    }


    /**
     * A simple helper to simplify getting elements from shadow DOM.
     * @param {string} selctor - The query to select the desired element.
     * @returns The first element in the shadow DOM that matches selector.
     */
    getEl(selctor) {return this.shadowRoot.querySelector(selctor)}

     /**
     * A simple helper to simplify getting all elements from shadow DOM
     * for a given query.
     * @param {string} selctors - The query to select the desired elements.
     * @returns All elements in the shadow DOM that matches selector.
     */
    getElements(selctors) {return this.shadowRoot.querySelectorAll(selctors)}

    /**
     * A helper to simplify the process of getting and adding an event
     * listener to to an element.
     * @param {string} selector - The query to select the desired element.
     * @param {*} type - The type of event to listen for (ex: click, blur, etc.)
     * @param {*} listenerCallback - The callback function to run on event.
     * @param {*} options - Optional list of option paramaters for the listener.
     */
    addListener(selector, type, listenerCallback, options) {
        this.getEl(selector).addEventListener(type, listenerCallback, options || undefined);
    }

    /**
     * A helper to simplify the process of getting and adding the same event
     * listener to multiple elements.
     * @param {string} selectors - The query to select the desired elements.
     * @param {*} type - The type of event to listen for (ex: click, blur, etc.)
     * @param {*} listenerCallback - The callback function to run on event.
     * @param {*} options - Optional list of option paramaters for the listener.
     */
    addListenerAll(selectors, type, listenerCallback, options) {
        this.getElements(selectors).forEach((e) => {
            e.addEventListener(type, listenerCallback, options || undefined);
        });
    }
}

customElements.define('edit-panel', editPanel);
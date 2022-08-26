import {closeModal} from "../scripts/modal.js";
import {updateLink} from "../scripts/api.js";
import {validShortID, validURL} from "../scripts/client-validators.js";

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

    disconnectedCallback() { // Detatch listeners:
        this.removeListenerAll('#btnCloseModal, #btnEditCancel', 'click', closeModal);
        this.removeListenerAll('#txtdestination, #txtshortID', 'input', this.notBlank.bind(this));
        this.getEl('#txtshortID').removeEventListener('input', this.shortIDChange.bind(this), {once: true});
        this.getEl('#btnEditSave').removeEventListener('click', this.saveChanges.bind(this));
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

                    <span id="nameErrorMsg" class="field-error"></span>
                </div> <!-- End of name field group -->
                <div class="field-group flex-column">
                    <label for="txtdestination">Destination URL</label>
                        <input type="text" 
                            id="txtdestination"
                            name="destination"
                            maxlength="6144" 
                            class="fancy-input" 
                            placeholder="Add a destination URL"
                            value="${this.linkData.destination || ''}">

                    <span id="destinationErrorMsg" class="field-error"></span>
                </div> <!-- End of destination url field group -->
                <div class="field-group flex-column">
                    <label for="txtshortID">URL Short ID</label>
                        <div class="shortID-bar">
                            <span id="baseUrl" class="input-addon prefix">${"!!!!!!!Domain Here!!!!!!"}</span>
                            <input type="text" 
                                id="txtshortID"
                                name="shortID" 
                                class="fancy-input has-prefix" 
                                placeholder="Add a custom back-half" 
                                value="${this.linkData.shortID || ''}">
                        </div>

                    <div id="shortIDErrorMsg" class="field-error"></div>
                </div> <!-- End of shortID field group -->

                <div class="fancy-buttons flex-right">
                    <button type="button" id="btnEditCancel">Cancel</button>
                    <button type="button" id="btnEditSave">Update</button>
                </div> <!-- End edit panel control buttons container -->
            </form> <!-- End edit form -->`;
    }

    attachListeners() {
        this.addListenerAll('#btnCloseModal, #btnEditCancel', 'click', closeModal); // Add close model button listeners.
        this.addListenerAll('#txtdestination, #txtshortID', 'input', this.notBlank.bind(this)); // Add field blank listeners.
        this.getEl('#txtshortID').addEventListener('input', this.shortIDChange.bind(this), {once: true}); // Check for shortID change.
        this.getEl('#btnEditSave').addEventListener('click', this.saveChanges.bind(this)); // Add save button listener.
    }

    // Event listeners:
    async saveChanges() {
        try {
            // Grab values from input fields:
            var newName = this.getEl('#txtName').value.trim() || null;
            var newDestination = this.getEl('#txtdestination').value.trim() || null;;
            var newShortID = this.getEl('#txtshortID').value.trim() || null;

            // Check if the new destination is not null and is a valid URL:
            if (typeof newDestination === 'string' && validURL(newDestination)) {
                // If the url doesn't include a protocol, then add the http:// protocol by default:
                if (!(/^(https?:\/\/)/.test(newDestination))) {
                    newDestination = 'http://' + newDestination;
                }
            } else { // Send invalid error if destination is blank or not a url:
                this.setInvalid('#txtdestination', true, 'Please enter a valid URL. For example, "https://example.com/videos".');
                this.setEditMessage(true, true, 'Please fix errors first');
                return;
            }

            // Send invalid error if the shortID is null, or isn't URL safe:
            if (typeof newShortID !== 'string' || !validShortID(newShortID)) {
                this.setInvalid('#txtshortID', true, 'The shortID cannot be blank, and must only include letters, numbers, underscores, and dashes.');
                this.setEditMessage(true, true, 'Please fix errors first');
                return;
            }
            
            const data = { // Package data in object, but only if it's diffrent than the current local value
                name: (newName !== this.linkData.name && newName !== 'Untitled') ? newName : null,
                destination: (newDestination !== this.linkData.destination) ? newDestination : null,
                shortID: (newShortID !== this.linkData.shortID) ? newShortID : null
            };

            this.setBtnLoading(true); // Set loading style button for request.
            // Remove old messages and invalid errors:
            this.setEditMessage(false); 
            this.setInvalid('#txtdestination', false);
            this.setInvalid('#txtshortID', false);
            
            const updatedLink = await updateLink(this.linkData.shortID, data); // Make request!

            /**
             *! Check that the link request was successful:
             * Right now it's set up to include a status code for an error, so if
             * the status code property is present then we display the error messages,
             * otherwise we can update the link data and display a success message.
             * This is not an ideal solution, but for now this works until I get
             * around to refactoring some of the backend error responses.
             */
            if (!updatedLink.statusCode) {
                // Successful request:
                if (!(this.callback instanceof Function)) { // Throw error if callback isn't a function.
                    throw new Error('Bad callback');
                }
                
                this.callback(updatedLink); // Exucute callback to update the link item.
                this.linkData = updatedLink; // Update data in this edit component.
                this.setEditMessage(true, false, 'Saved Changes'); // Success message.
            } else {
                // Failed Request:
                this.setEditMessage(true, true, updatedLink.description || 'Something went wrong');
                (updatedLink.errors || []).forEach((error) => { // Display field errors from response.
                    this.setInvalid(`#txt${error.field}`, true, error.message);
                });
            } 
        } catch (e) {
            console.error(e);
            this.setEditMessage(true, true, 'Something went wrong', 10000);
        }

        this.setBtnLoading(false); // Remove loading button style.
    }

    async notBlank(event) {
        const element = event.target;
        if (element.value.length === 0) { // If input is blank:
            this.getEl('#btnEditSave').setAttribute('disabled', ''); // Disable the update button.
            this.setInvalid(`#${element.id}`, true, `The ${element.name} cannot be empty`); // Add invalid styles and Message.
        } else { // If input isn't blank:
            this.getEl('#btnEditSave').removeAttribute('disabled'); // Enable the update button.
            this.setInvalid(`#${element.id}`, false); // Remove invalid styles and Message.
        }
    }

    async shortIDChange() {
        const shortIDField = this.getEl('#txtshortID');
        if (shortIDField.value !== this.linkData.shortID) { // When the shortID changes we let them know the implications.
            this.setEditMessage(true, true, "Please be aware that changing the shortID will cause the old short link and QRCode to stop working.");
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
     * @param {*} selector - The selector of the element.
     * @param {boolean} isInvalid - The invalid state (default true for invalid).
     * @param {string} errorMsg - The error message to be displayed below the field.
     */
    async setInvalid(selector = null, isInvalid = true, errorMsg = null) {
        try {
            const element = this.getEl(selector);

            if (isInvalid) {
                element.classList.add('invalid');
                this.getEl(`#${element.name}ErrorMsg`).innerHTML = errorMsg || `Invalid or missing ${element.name}`;
            } else {
                element.classList.remove('invalid');
                this.getEl(`#${element.name}ErrorMsg`).innerHTML = '';
            }
        } catch (e) {
            // console.error(e);
        }
    }

    /**
     * Helper to easily display and remove the edit message.
     * @param {boolean} setVisable - Defines if the message should be displayed or removed.
     * @param {boolean} isWarning - Defines if the message should be in a warning style or info style.
     * @param {string} message - The message text content. 
     * @param {number} timeOut - The time in milliseconds that the message should last (optional).
     */
    async setEditMessage(setVisable = false, isWarning = true, message = null, timeOut = null) {
        const modalContent = this.getEl('.modal-content');
        let editMsg = this.getEl('#editPanelMessage');
        if (!!editMsg) modalContent.removeChild(editMsg); // Remove existing message if applicable.

        if (setVisable) {
            const messageTemplate = document.createElement('template');
            messageTemplate.innerHTML = `
                <div id="editPanelMessage" class="message-container has-icon ${(isWarning) ? 'warning' : 'info'}">
                    <i class="fa-solid ${(isWarning) ? 'fa-circle-exclamation' : 'fa-circle-check'}" aria-hidden="true"></i>
                    <span id="editMsg" aria-label="Edit Message">${message || ((isWarning) ? 'Something went wrong' : 'All Set')}</span>
                    <!-- End of update messages (message-container) -->
                </div>`;
            modalContent.append(messageTemplate.content);

            if (!!timeOut) {
                setTimeout(() => {
                   this.setEditMessage(false);
                }, timeOut);
            }
        }
    }

    /**
     * Helper to add and remove the save button loading state style.
     * @param {boolean} state - Defines if the button is loading or not (default false).
     */
    async setBtnLoading(state = false) {
        if (state) {
            this.getEl('#btnEditSave').classList.add('loading');
        } else {
            this.getEl('#btnEditSave').classList.remove('loading');
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

    /**
     * A helper to simplify the process of getting and removing the same event
     * listener to multiple elements.
     * @param {string} selectors - The query to select the desired elements.
     * @param {*} type - The type of event listener (ex: click, blur, etc.)
     * @param {*} listenerCallback - The callback function to remove.
     */
     removeListenerAll(selectors, type, listenerCallback) {
        this.getElements(selectors).forEach((e) => {
            e.removeEventListener(type, listenerCallback);
        });
    }
}

customElements.define('edit-panel', editPanel);
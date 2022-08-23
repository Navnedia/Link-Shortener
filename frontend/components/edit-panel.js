import {closeModal} from "../scripts/test-modal.js";

class editPanel extends HTMLElement {
    constructor() {
        super();
        // this.name = "";
        // this.shortID = "";
        // this.destination = "";
        this.linkItem = {};
        this.attachShadow({mode: 'open'}); // Create shadow root.
    }

    setData(linkItem) {
        // this.name = properties.name || "Untitled";
        // this.shortID = properties.shortID || "";
        // this.destination = properties.destination || "";
        this.linkItem = linkItem || {};
    }

    connectedCallback() {
        this.render();

        (this.shadowRoot.querySelectorAll('#btnCloseModal, #btnEditCancel') || []).forEach((e => {
            e.addEventListener('click', closeModal);
        }));
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
                            value="${this.linkItem.name}">

                    <span id="nameErrorMsg" class="field-error ellipsis"></span>
                </div> <!-- End of name field group -->
                <div class="field-group flex-column">
                    <label for="txtDestination">Long URL</label>
                        <input type="text" 
                            id="txtDestination" 
                            maxlength="6144" 
                            class="fancy-input" 
                            placeholder="Add a destination URL"
                            value="${this.linkItem.destination}">

                    <span id="destinationErrorMsg" class="field-error ellipsis"></span>
                </div> <!-- End of destination url field group -->
                <div class="field-group flex-column">
                    <label for="txtShortName">URL Short ID</label>
                        <div class="shortID-bar">
                            <span id="baseUrl" class="input-addon prefix">${"Domain Here"}</span>
                            <input type="text" 
                                id="txtShortName" 
                                class="fancy-input has-prefix" 
                                placeholder="Add a custom back-half" 
                                value="${this.linkItem.shortID}">
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
}

customElements.define('edit-panel', editPanel);
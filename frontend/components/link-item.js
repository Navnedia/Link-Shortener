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
                <!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
        
                <button id="btnCopy" type="button" class="action-btn" tooltip="Copy">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path d="M320 64h-49.61C262.1 27.48 230.7 0 192 0S121 27.48 113.6 64H64C28.65 64 0 
                            92.66 0 128v320c0 35.34 28.65 64 64 64h256c35.35 0 64-28.66 64-64V128C384 92.66
                            355.3 64 320 64zM192 48c13.23 0 24 10.77 24 24S205.2 96 192 96S168 85.23 168 
                            72S178.8 48 192 48zM336 448c0 8.82-7.178 16-16 16H64c-8.822 0-16-7.18-16-16V128c0-8.82
                            7.178-16 16-16h18.26C80.93 117.1 80 122.4 80 128v16C80 152.8 87.16 160 96 160h192c8.836
                            0 16-7.164 16-16V128c0-5.559-.9316-10.86-2.264-16H320c8.822 0 16 7.18 16 16V448z"/>
                    </svg>
                </button>
                <button id="btnShare" type="button" class="action-btn" tooltip="Share">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M503.7 226.2l-176 151.1c-15.38 13.3-39.69 2.545-39.69-18.16V272.1C132.9 274.3
                            66.06 312.8 111.4 457.8c5.031 16.09-14.41 28.56-28.06 18.62C39.59 444.6 0 383.8 0 
                            322.3c0-152.2 127.4-184.4 288-186.3V56.02c0-20.67 24.28-31.46 39.69-18.16l176 
                            151.1C514.8 199.4 514.8 216.6 503.7 226.2z"/>
                    </svg>
                </button>
                <button id="btnQRCode" type="button" class="action-btn" tooltip="QRCode">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path d="M144 32C170.5 32 192 53.49 192 80V176C192 202.5 170.5 224 144 224H48C21.49 224
                            0 202.5 0 176V80C0 53.49 21.49 32 48 32H144zM128 96H64V160H128V96zM144 288C170.5 288 
                            192 309.5 192 336V432C192 458.5 170.5 480 144 480H48C21.49 480 0 458.5 0 432V336C0 
                            309.5 21.49 288 48 288H144zM128 352H64V416H128V352zM256 80C256 53.49 277.5 32 304 
                            32H400C426.5 32 448 53.49 448 80V176C448 202.5 426.5 224 400 224H304C277.5 224 256 
                            202.5 256 176V80zM320 160H384V96H320V160zM352 448H384V480H352V448zM448 
                            480H416V448H448V480zM416 288H448V416H352V384H320V480H256V288H352V320H416V288z"/>
                    </svg>
                </button>
                <button id="btnEdit" type="button" class="action-btn" tooltip="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path d="M421.7 220.3L188.5 453.4L154.6 419.5L158.1 416H112C103.2 416 96 408.8 96 
                            400V353.9L92.51 357.4C87.78 362.2 84.31 368 82.42 374.4L59.44 452.6L137.6 429.6C143.1 
                            427.7 149.8 424.2 154.6 419.5L188.5 453.4C178.1 463.8 165.2 471.5 151.1 475.6L30.77 
                            511C22.35 513.5 13.24 511.2 7.03 504.1C.8198 498.8-1.502 489.7 .976 481.2L36.37 
                            360.9C40.53 346.8 48.16 333.9 58.57 323.5L291.7 90.34L421.7 220.3zM492.7 58.75C517.7 
                            83.74 517.7 124.3 492.7 149.3L444.3 197.7L314.3 67.72L362.7 19.32C387.7-5.678 
                            428.3-5.678 453.3 19.32L492.7 58.75z"/>
                    </svg>
                </button>
                <button id="btnDel" type="button" class="action-btn" tooltip="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path d="M135.2 17.69C140.6 6.848 151.7 0 163.8 0H284.2C296.3 0 307.4 6.848 312.8 17.69L320 
                            32H416C433.7 32 448 46.33 448 64C448 81.67 433.7 96 416 96H32C14.33 96 0 81.67 0 64C0 46.33 
                            14.33 32 32 32H128L135.2 17.69zM31.1 128H416V448C416 483.3 387.3 512 352 512H95.1C60.65 512 
                            31.1 483.3 31.1 448V128zM111.1 208V432C111.1 440.8 119.2 448 127.1 448C136.8 448 143.1 440.8 
                            143.1 432V208C143.1 199.2 136.8 192 127.1 192C119.2 192 111.1 199.2 111.1 208zM207.1 
                            208V432C207.1 440.8 215.2 448 223.1 448C232.8 448 240 440.8 240 432V208C240 199.2 232.8 192 
                            223.1 192C215.2 192 207.1 199.2 207.1 208zM304 208V432C304 440.8 311.2 448 320 448C328.8 
                            448 336 440.8 336 432V208C336 199.2 328.8 192 320 192C311.2 192 304 199.2 304 208z"/>
                    </svg>
                </button>
            </div> <!-- End of action buttons -->
        </div> <!-- End of link-item -->`;

        this.shadowRoot.appendChild(linkItemTemplate.content);

        // Attach event listeners:
        this.shadowRoot.getElementById('btnCopy')
            .addEventListener('click', this.copyLinkToClipboard.bind(this));

        // this.shadowRoot.getElementById('btnDel').addEventListener('click', () => {
        //     //! We need to have a confirm, then we call the api.

        //     this.parentNode.removeChild(this);
        // });
    }

    // updateContent() {
    //     this.shadowRoot.innerHTML = `
    //     <link rel="stylesheet" href="styles/shortlink-card.css">
    //     <div class="link-item">
    //         <span class="created-date">${this.created}</span>
    //         <h2 class="link-title ellipsis" tabindex="0">${this.name ?? "Untitled"}</h2>
        
    //         <span class="destination link ellipsis">
    //             <a href="${this.destination}" target="_blank"">${this.destination}</a>
    //         </span>
        
    //         <hr>
        
    //         <span class="shortlink link ellipsis">
    //             <a href="${this.link}" target="_blank">${this.link}</a>
    //         </span>
    //         <span class="clicks">${this.clicks} Clicks</span>
        
    //         <div class="item-action-buttons">
    //             <!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
        
    //             <button id="btnCopy" type="button" class="action-btn" tooltip="Copy">
    //                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
    //                     <path d="M320 64h-49.61C262.1 27.48 230.7 0 192 0S121 27.48 113.6 64H64C28.65 64 0 
    //                         92.66 0 128v320c0 35.34 28.65 64 64 64h256c35.35 0 64-28.66 64-64V128C384 92.66
    //                         355.3 64 320 64zM192 48c13.23 0 24 10.77 24 24S205.2 96 192 96S168 85.23 168 
    //                         72S178.8 48 192 48zM336 448c0 8.82-7.178 16-16 16H64c-8.822 0-16-7.18-16-16V128c0-8.82
    //                         7.178-16 16-16h18.26C80.93 117.1 80 122.4 80 128v16C80 152.8 87.16 160 96 160h192c8.836
    //                         0 16-7.164 16-16V128c0-5.559-.9316-10.86-2.264-16H320c8.822 0 16 7.18 16 16V448z"/>
    //                 </svg>
    //             </button>
    //             <button id="btnShare" type="button" class="action-btn" tooltip="Share">
    //                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    //                     <path d="M503.7 226.2l-176 151.1c-15.38 13.3-39.69 2.545-39.69-18.16V272.1C132.9 274.3
    //                         66.06 312.8 111.4 457.8c5.031 16.09-14.41 28.56-28.06 18.62C39.59 444.6 0 383.8 0 
    //                         322.3c0-152.2 127.4-184.4 288-186.3V56.02c0-20.67 24.28-31.46 39.69-18.16l176 
    //                         151.1C514.8 199.4 514.8 216.6 503.7 226.2z"/>
    //                 </svg>
    //             </button>
    //             <button id="btnQRCode" type="button" class="action-btn" tooltip="QRCode">
    //                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    //                     <path d="M144 32C170.5 32 192 53.49 192 80V176C192 202.5 170.5 224 144 224H48C21.49 224
    //                         0 202.5 0 176V80C0 53.49 21.49 32 48 32H144zM128 96H64V160H128V96zM144 288C170.5 288 
    //                         192 309.5 192 336V432C192 458.5 170.5 480 144 480H48C21.49 480 0 458.5 0 432V336C0 
    //                         309.5 21.49 288 48 288H144zM128 352H64V416H128V352zM256 80C256 53.49 277.5 32 304 
    //                         32H400C426.5 32 448 53.49 448 80V176C448 202.5 426.5 224 400 224H304C277.5 224 256 
    //                         202.5 256 176V80zM320 160H384V96H320V160zM352 448H384V480H352V448zM448 
    //                         480H416V448H448V480zM416 288H448V416H352V384H320V480H256V288H352V320H416V288z"/>
    //                 </svg>
    //             </button>
    //             <button id="btnEdit" type="button" class="action-btn" tooltip="Edit">
    //                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    //                     <path d="M421.7 220.3L188.5 453.4L154.6 419.5L158.1 416H112C103.2 416 96 408.8 96 
    //                         400V353.9L92.51 357.4C87.78 362.2 84.31 368 82.42 374.4L59.44 452.6L137.6 429.6C143.1 
    //                         427.7 149.8 424.2 154.6 419.5L188.5 453.4C178.1 463.8 165.2 471.5 151.1 475.6L30.77 
    //                         511C22.35 513.5 13.24 511.2 7.03 504.1C.8198 498.8-1.502 489.7 .976 481.2L36.37 
    //                         360.9C40.53 346.8 48.16 333.9 58.57 323.5L291.7 90.34L421.7 220.3zM492.7 58.75C517.7 
    //                         83.74 517.7 124.3 492.7 149.3L444.3 197.7L314.3 67.72L362.7 19.32C387.7-5.678 
    //                         428.3-5.678 453.3 19.32L492.7 58.75z"/>
    //                 </svg>
    //             </button>
    //             <button id="btnDel" type="button" class="action-btn" tooltip="Delete">
    //                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
    //                     <path d="M135.2 17.69C140.6 6.848 151.7 0 163.8 0H284.2C296.3 0 307.4 6.848 312.8 17.69L320 
    //                         32H416C433.7 32 448 46.33 448 64C448 81.67 433.7 96 416 96H32C14.33 96 0 81.67 0 64C0 46.33 
    //                         14.33 32 32 32H128L135.2 17.69zM31.1 128H416V448C416 483.3 387.3 512 352 512H95.1C60.65 512 
    //                         31.1 483.3 31.1 448V128zM111.1 208V432C111.1 440.8 119.2 448 127.1 448C136.8 448 143.1 440.8 
    //                         143.1 432V208C143.1 199.2 136.8 192 127.1 192C119.2 192 111.1 199.2 111.1 208zM207.1 
    //                         208V432C207.1 440.8 215.2 448 223.1 448C232.8 448 240 440.8 240 432V208C240 199.2 232.8 192 
    //                         223.1 192C215.2 192 207.1 199.2 207.1 208zM304 208V432C304 440.8 311.2 448 320 448C328.8 
    //                         448 336 440.8 336 432V208C336 199.2 328.8 192 320 192C311.2 192 304 199.2 304 208z"/>
    //                 </svg>
    //             </button>
    //         </div> <!-- End of action buttons -->
    //     </div> <!-- End of link-item -->`;
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
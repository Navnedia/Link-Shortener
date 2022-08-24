const modalWrapper = document.getElementById('modalWrapper');
const modalBody = document.getElementById('modalBody');

/**
 * Constructs and opens the specified modal with the link
 * data attached.
 * @param {string} modalType - The string value of the modal element you wish to open.
 * @param {object} linkItem - The referece to the linkItem we are editing.
 */
export async function openModal(modalType, linkItem, callback) {
    const modalElement = document.createElement(modalType);
    modalElement.setData(linkItem, callback);

    closeModal(); // Close any existing modals.
    modalBody.append(modalElement);
    modalWrapper.classList.remove('hidden');
    document.body.classList.add('no-scroll');
}

/**
 * Closes all open modals.
 */
export async function closeModal() {
    document.body.classList.remove('no-scroll');
    modalWrapper.classList.add('hidden');    
    modalBody.innerHTML = "";
}
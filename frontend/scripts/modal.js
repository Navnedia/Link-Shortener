const modalWrapper = document.getElementById('modalWrapper');
const modalBody = document.getElementById('modalBody');

/**
 * Constructs and opens the specified modal with the link
 * data attached.
 * @param {string} modalType - The string value of the modal element you wish to open.
 * @param {object} linkItem - The referece to the linkItem we are editing.
 */
export async function openModal(modalType, linkItem) {
    const modalElement = document.createElement(modalType);
    modalElement.setData(linkItem);

    closeModal(); // Close any existing modals.
    modalBody.append(modalElement);
    modalWrapper.classList.remove('hidden');
}

/**
 * Closes all open modals.
 */
export async function closeModal() {
    modalWrapper.classList.add('hidden');    
    modalBody.innerHTML = "";
}
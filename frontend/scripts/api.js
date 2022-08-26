import {API_URL, UNAVALIABLE_RESPONSE} from "./config.js";

export async function createLink(reqBody) {
    const response = await fetch(`${API_URL}/shortlinks/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody || '')
    }).catch(e => null);
    
    if (response && response.ok) {
        try {
            const data = await response.json();
            return data;
        } catch (e) {
            console.error(e);
            return UNAVALIABLE_RESPONSE;
        }
    }

    return UNAVALIABLE_RESPONSE;
}

export async function getAllLinks() {
    const response = await fetch(`${API_URL}/shortlinks/`, {
        method: 'GET'
    }).catch(e => null);

    if (response && response.ok) {
        try {
            const data = await response.json();
            return data;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    return [];
}

export async function removeLink(shortID) {
    // Temp solution for if we try to remove without a shortID
    // In the future I will handle this server side as well.
    if (!shortID) {
        return {
            statusCode: 400,
            message: 'Bad Request',
            description: 'Something went wrong, missing shortID'
        }; 
    }
    const response = await fetch(`${API_URL}/shortlinks/${shortID || ''}`, {
        method: 'DELETE'
    }).catch(e => null);
    if (response && response.ok) return {};

    return UNAVALIABLE_RESPONSE;
}

export async function updateLink(shortID, reqBody) {
    // Temp solution for if we try to remove without a shortID
    // In the future I will handle this server side as well.
    if (!shortID) {
        return {
            statusCode: 400,
            message: 'Bad Request',
            description: 'Something went wrong, missing shortID'
        };
    }

    const response = await fetch(`${API_URL}/shortlinks/${shortID || ''}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody || '')
    }).catch(e => null);

    if (response) {
        try {
            const data = await response.json();
            return data;
        } catch (e) {
            console.error(e);
            return UNAVALIABLE_RESPONSE;       
        }
    }

    return UNAVALIABLE_RESPONSE;
}
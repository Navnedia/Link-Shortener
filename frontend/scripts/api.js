const BASE_URL = 'http://localhost:8080';


export async function createLink(reqBody) {
    const response = await fetch(`${BASE_URL}/api/shortlinks/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody || '')
    }).catch(e => null);
    
    //! In this case we must still accept & handle failed validation responses. 

    if (response && response.ok) {
        try {
            const data = await response.json();
            return data;
        } catch (e) {
            console.error(e);
            return {
                statusCode: 503,
                message: 'Service Unavailable',
                description: 'Something went wrong, please try again later.'
            };
        }
    }

    return {
        statusCode: 503,
        message: 'Service Unavailable',
        description: 'Something went wrong, please try again later.'
    };
}

export async function getAllLinks() {
    const response = await fetch(`${BASE_URL}/api/shortlinks/`, {
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
        return {description: 'Something went wrong, missing shortID'};    
    }

    const response = await fetch(`${BASE_URL}/api/shortlinks/${shortID || ''}`, {
        method: 'DELETE'
    }).catch(e => null);
    if (response && response.ok) return {};

    return {description: 'Something went wrong, please try again later.'};
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
    // if (Object.keys(reqBody).length === 0) {} // Should I do something if the data is empty?

    const response = await fetch(`${BASE_URL}/api/shortlinks/${shortID || ''}`, {
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
            return {
                statusCode: 503,
                message: 'Service Unavailable',
                description: 'Something went wrong, please try again later.'
            };            
        }
    }

    return {
        statusCode: 503,
        message: 'Service Unavailable',
        description: 'Something went wrong, please try again later.'
    };
}
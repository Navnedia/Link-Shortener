const BASE_URL = 'http://localhost:8080';


export async function createLink(reqBody) {
    const response = await fetch(`${BASE_URL}/api/shortlinks/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reqBody || '')
    }).catch(e => console.error(e));
    
    //! In this case we must still accept & handle failed validation responses. 

    if (response && response.ok) {
        try {
            const data = await response.json();
            return data;
        } catch (e) {
            console.error(e);
            return;
        }
    }

    return;
}

export async function getAllLinks() {
    const response = await fetch(`${BASE_URL}/api/shortlinks/`, {
        method: 'GET'
    }).catch(e => console.error(e));
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
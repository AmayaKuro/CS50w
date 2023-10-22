const BACKEND_URL = 'http://127.0.0.1:8000/api/'


export const fetchAPI = async (url: string, access_token: string, options?: RequestInit) => {
    try {
        const response = await fetch(`${BACKEND_URL}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`,
            },
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const data = await response.json();

        return data;
    }
    catch (e) {
        if (e instanceof Error) {
            throw new Error(e.message);
        }
        else {
            throw new Error('Something went wrong');
        }
    }
};
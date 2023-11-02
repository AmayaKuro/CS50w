import { BACKEND_URL } from '../env';

export const BEfetch = async (url: string, options?: RequestInit) => {
    try {
        const response = await fetch(`${BACKEND_URL}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
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
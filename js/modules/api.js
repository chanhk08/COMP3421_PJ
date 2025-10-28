/**
 * js/api.js
 * 通用的 API 請求函式
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
    const API_BASE_URL = 'api';
    let url = `${API_BASE_URL}/${endpoint}`;

    const options = {
        method: method,
        headers: { ...(body && { 'Content-Type': 'application/json' }) }
    };

    if (body) {
        if (method === 'GET' && Object.keys(body).length) {
            url += `?${new URLSearchParams(body).toString()}`;
        } else if (method !== 'GET') {
            options.body = JSON.stringify(body);
        }
    }

    try {
        const response = await fetch(url, options);
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
        }
        return responseData;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

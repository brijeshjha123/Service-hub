// import axios from 'axios';

// const api = axios.create({
//     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// // Add Interceptor to attach token
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     console.log(`[API REQUEST] ${config.method.toUpperCase()} ${config.url}`);
//     return config;
// });

// // Add response interceptor for debugging
// api.interceptors.response.use(
//     (response) => {
//         console.log(`[API SUCCESS] ${response.config.method.toUpperCase()} ${response.config.url}`);
//         return response;
//     },
//     (error) => {
//         console.error(`[API ERROR] ${error.config?.method.toUpperCase()} ${error.config?.url}:`, error.response?.data || error.message);
//         return Promise.reject(error);
//     }
// );

// export default api;


import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API REQUEST] ${config.method.toUpperCase()} ${config.url}`);
    return config;
});

// Response logging
api.interceptors.response.use(
    (response) => {
        console.log(`[API SUCCESS] ${response.config.method.toUpperCase()} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error(
            `[API ERROR] ${error.config?.method.toUpperCase()} ${error.config?.url}:`,
            error.response?.data || error.message
        );
        return Promise.reject(error);
    }
);

export default api;


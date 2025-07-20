import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Your backend URL
});

// Interceptor to add the JWT token to every request
API.interceptors.request.use((req) => {
    if (localStorage.getItem('token')) {
        req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }
    return req;
});

export default API;

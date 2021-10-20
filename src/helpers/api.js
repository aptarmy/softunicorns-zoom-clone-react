import axios from 'axios';

const axiosInstance = axios.create({ baseURL: process.env.REACT_APP_API_SERVER });
export const updateAuthHeader = token => {
	if(!token) { return delete axiosInstance.defaults.headers.common['Authorization']; }
	axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const loginAPI = idToken => axiosInstance.post('/login', { idToken }).then(res => res.data).catch(err => { throw new Error(err.response.data.error) });

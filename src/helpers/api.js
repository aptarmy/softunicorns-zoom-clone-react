import axios from 'axios';
import { message } from 'antd';
import store from '../store';
import { logout } from '../store/userReducer';

const axiosInstance = axios.create({ baseURL: process.env.REACT_APP_API_SERVER });
axiosInstance.interceptors.response.use(response => response, error => {
	if(error.response && error.response.data) { message.error(error.response.data.error) }
	if(error.response && error.response.status === 401 && store.getState().user.id !== null) { store.dispatch(logout()) }
  return Promise.reject(error);
});

export const updateAuthHeader = token => {
	if(!token) { return delete axiosInstance.defaults.headers.common['Authorization']; }
	axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const loginAPI = idToken => axiosInstance.post('/login', { idToken }).then(res => res.data).catch(err => { throw new Error(err.response.data.error) });
export const createRoomAPI = () => axiosInstance.post('/room').then(res => res.data).catch(err => { throw new Error(err.response.data.error) });
export const getRoomAPI = roomSlug => axiosInstance.get(`/room/${roomSlug}`).then(res => res.data).catch(err => { throw new Error(err.response.data.error) });

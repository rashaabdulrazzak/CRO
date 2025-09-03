
import axios from 'axios';

const api = axios.create({
  baseURL: 'localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
  },
});

// Auth
export const authRegister = (registerData:any) => {
  return api.post('/retailers/auth/register',registerData);
};

export const authLogin = (loginData:any) => {
  return api.post('/retailers/auth/login', loginData);
 
};

export const forgotPassword = (email:any) => {
  return api.post('/retailers/auth/forgot_password',email);
};

export const resetPassword = (resetData:any) => {
  return api.post('/retailers/auth/reset_password',resetData);
};

export default api;

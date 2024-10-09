// src/axiosInstance.js
import axios from 'axios';
import { createClient } from './supabase/client';

const axiosInstance = axios.create({
  headers: { 'Content-Type': 'application/json' }
});

// Add a request interceptor
const supabase = createClient()
// Add a response interceptor
axios.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  supabase
    .from('user_history')
    .insert({ email: user?.email || profile?.email, transaction_data: error, product: en.product })
    .select('*')

  return Promise.reject(error);
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  function (response) {
    // Do something with the response data
    console.log('Response:', response);
    return response;
  },
  function (error) {
    // Handle the response error
    if (error.response && error.response.status === 401) {
      // Handle unauthorized error
      console.error('Unauthorized, logging out...');
      // Perform any logout actions or redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

"use client"
// src/axiosInstance.js
import axios from 'axios';
import { createClient } from './supabase/client';
import en from '@/assets/en.json';
const axiosInstance = axios.create({
  headers: { 'Content-Type': 'application/json' }
});

const supabase = createClient()

axiosInstance.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  let email;
  try {
    email = localStorage.getItem('email')
  }
  catch (e) {
    email = "not stored"
  }
  supabase
    .from('user_history')
    .insert({ email, transaction_data: { ...error.response }, product: en?.product, type: "ERROR", action: "Axios Error" })
    .select('*')
  return Promise.reject(error);
});

export default axiosInstance;

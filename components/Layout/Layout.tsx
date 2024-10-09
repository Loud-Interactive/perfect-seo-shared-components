'use client'
import { Links } from '@/perfect-seo-shared-components/data/types';
import Footer from '../Footer/Footer'
import Header from '../Header/Header'
import style from './Layout.module.scss'
import "bootstrap-icons/font/bootstrap-icons.css";
import Script from 'next/script';
import { SessionProvider } from "next-auth/react"
import axios from 'axios';
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client';
import { useSelector } from 'react-redux';
import { RootState } from '@/perfect-seo-shared-components/lib/store';
import en from '@/assets/en.json';
import axiosInstance from '@/perfect-seo-shared-components/utils/axiosInstance';

interface LayoutProps extends React.HTMLProps<HTMLDivElement> {
  hideFooter?: boolean,
  current: string;
  links?: Links[];
  hasLogin?: boolean;
  getCredits?: boolean;
}

const Layout = ({ children, hideFooter, current, links, hasLogin = true, getCredits = false }: LayoutProps) => {
  const { user, profile } = useSelector((state: RootState) => state);

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
  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossOrigin="anonymous" />
      <SessionProvider refetchOnWindowFocus={true}>
        <Header current={current} links={links} hasLogin={hasLogin} getCredits={getCredits} />
        <main className={style.wrap}>
          {children}
        </main>
        {!hideFooter && <Footer current={current} />}
      </SessionProvider>
    </>
  )
}

export default Layout
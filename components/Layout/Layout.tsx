'use client'
import { Links } from '@/perfect-seo-shared-components/data/types';
import Footer from '../Footer/Footer'
import Header from '../Header/Header'
import style from './Layout.module.scss'
import "bootstrap-icons/font/bootstrap-icons.css";
import Script from 'next/script';
import { SessionProvider } from "next-auth/react"
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

  const supabase = createClient()

  axiosInstance.interceptors.response.use(function (response) {
    console.log("interceptor received response")
    let email;
    try {
      email = localStorage.getItem('email')
    }
    catch (e) {
      email = user?.email || profile?.email
    }
    supabase
      .from('user_history')
      .insert({ email, transaction_data: { ...response.data }, product: en?.product, type: "Response" })
      .select('*')
      .then(res => {
        console.log(res)
      })
    return response;
  }, function (error) {
    let email;
    try {
      email = localStorage.getItem('email')
    }
    catch (e) {
      email = user?.email || profile?.email
    }
    supabase
      .from('user_history')
      .insert({ email, transaction_data: { ...error.response }, product: en?.product, type: "Error" })
      .select('*')
    return Promise.reject(error);
  });


  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" crossOrigin="anonymous" />
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
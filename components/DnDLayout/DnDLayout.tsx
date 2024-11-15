"use client"
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { BrowserView, MobileView } from 'react-device-detect';
import { DndProvider } from 'react-dnd';
import { Links } from '@/perfect-seo-shared-components/data/types';
import Footer from '../Footer/Footer'
import Header from '../Header/Header'
import style from './DnDLayout.module.scss'
import "bootstrap-icons/font/bootstrap-icons.css";
import Script from 'next/script';
import { SessionProvider } from "next-auth/react"
import axiosInstance from '@/perfect-seo-shared-components/utils/axiosInstance';
import { RootState } from '@/perfect-seo-shared-components/lib/store';
import { createClient } from '@/perfect-seo-shared-components/utils/supabase/client';
import { useSelector } from 'react-redux';
import en from '@/assets/en.json';
import { selectEmail } from '@/perfect-seo-shared-components/lib/features/User';
import { Suspense } from 'react';


interface DnDLayoutProps extends React.HTMLProps<HTMLDivElement> {
  hideFooter?: boolean,
  current: string;
  links?: Links[];
  hasLogin?: boolean;
  getCredits?: boolean;
}

const DnDLayout = ({ children, hideFooter, current, links, hasLogin = true, getCredits = false }: DnDLayoutProps) => {

  const email = useSelector(selectEmail)
  const supabase = createClient()

  axiosInstance.interceptors.response.use(function (response) {
    return response;
  }, function (error) {

    supabase
      .from('user_history')
      .insert({ email: email, transaction_data: error, product: en.product, type: "Error" })
      .select('*')
    return Promise.reject(error);
  });

  return (
    <>
      <SessionProvider refetchOnWindowFocus refetchInterval={20 * 60} >
        <BrowserView>
          <DndProvider backend={HTML5Backend} >
            <Suspense>
              <Header current={current} links={links} hasLogin={hasLogin} getCredits={getCredits} />
            </Suspense>
            <main className={style.wrap}>
              {children}
            </main>
            {!hideFooter && <Footer current={current} />}
          </DndProvider>
        </BrowserView>
        <MobileView>
          <DndProvider backend={TouchBackend} options={{ ignoreContextMenu: true, enableMouseEvents: true }}>
            <Suspense>
              <Header current={current} links={links} hasLogin={hasLogin} getCredits={getCredits} />
            </Suspense>

            <main className={style.wrap}>
              {children}
            </main>
            {!hideFooter && <Footer current={current} />}
          </DndProvider>
        </MobileView>
      </SessionProvider>
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" crossOrigin="anonymous" />

    </>
  )
}

export default DnDLayout
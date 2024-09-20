'use client'
import { Links, OneSignalOptions } from '@/perfect-seo-shared-components/data/types';
import Footer from '../Footer/Footer'
import Header from '../Header/Header'
import style from './Layout.module.scss'
import "bootstrap-icons/font/bootstrap-icons.css";
import Script from 'next/script';
import useNotification from '@/perfect-seo-shared-components/hooks/useNotifications';
import { useEffect } from 'react';
import { RootState } from '@/perfect-seo-shared-components/lib/store';
import { useSelector } from 'react-redux';


interface LayoutProps extends React.HTMLProps<HTMLDivElement> {
  hideFooter?: boolean,
  current: string;
  links?: Links[];
  hasLogin?: boolean;
  getCredits?: boolean;
  notificationConfig?: OneSignalOptions;
}

const Layout = ({ children, hideFooter, current, links, hasLogin = true, getCredits = false, notificationConfig = null }: LayoutProps) => {
  const { runOneSignal } = useNotification()
  const { isLoggedIn } = useSelector((state: RootState) => state);
  useEffect(() => {
    if (notificationConfig && isLoggedIn) {
      runOneSignal(notificationConfig)
    }
  }, [notificationConfig, isLoggedIn])

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossOrigin="anonymous" />
      <Header current={current} links={links} hasLogin={hasLogin} getCredits={getCredits} />
      <main className={style.wrap}>
        {children}
      </main>
      {!hideFooter && <Footer current={current} />}
    </>
  )
}

export default Layout
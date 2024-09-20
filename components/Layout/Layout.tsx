'use client'
import { Links } from '@/perfect-seo-shared-components/data/types';
import Footer from '../Footer/Footer'
import Header from '../Header/Header'
import style from './Layout.module.scss'
import "bootstrap-icons/font/bootstrap-icons.css";
import Script from 'next/script';
import { useEffect } from 'react';


interface LayoutProps extends React.HTMLProps<HTMLDivElement> {
  hideFooter?: boolean,
  current: string;
  links?: Links[];
  hasLogin?: boolean;
  getCredits?: boolean;
  checkNotification?: boolean;
}

const Layout = ({ children, hideFooter, current, links, hasLogin = true, getCredits = false, checkNotification = false }: LayoutProps) => {

  useEffect(() => {
    if (checkNotification) {
      if ('Notification' in window) {
        if (Notification.permission) {
          console.log(Notification.permission)
        }
        if (Notification.permission !== 'denied') {
          // Request permission
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              // Permission granted
            } else {
              // Permission denied
            }
          });
        }
      }
    }
  }, [checkNotification]);

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
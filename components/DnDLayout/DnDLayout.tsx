"use client"
// Import necessary modules and components
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { BrowserView, MobileView } from 'react-device-detect';
import { DndProvider } from 'react-dnd';
import { Links } from '@/perfect-seo-shared-components/data/types';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import style from './DnDLayout.module.scss';
import Script from 'next/script';
import { SessionProvider } from "next-auth/react";
import { Suspense } from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";

// Define the props for the DnDLayout component
interface DnDLayoutProps extends React.HTMLProps<HTMLDivElement> {
  hideFooter?: boolean,
  current: string;
  links?: Links[];
  hasLogin?: boolean;
  getCredits?: boolean;
}

// Main DnDLayout component
const DnDLayout = ({ children, hideFooter, current, links, hasLogin = true, getCredits = false }: DnDLayoutProps) => {
  return (
    <>
      <SessionProvider refetchOnWindowFocus refetchInterval={20 * 60}>
        <BrowserView>
          <DndProvider backend={HTML5Backend}>
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
  );
}

export default DnDLayout;
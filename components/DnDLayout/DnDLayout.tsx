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
import { Suspense, useEffect } from 'react';
import "bootstrap-icons/font/bootstrap-icons.css";
import ToastProvider from '../Toast/ToastProvider';
import useViewport from '@/perfect-seo-shared-components/hooks/useViewport';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { selectShowQueue, setShowQueue } from '@/perfect-seo-shared-components/lib/features/User';
import Queue from '@/components/Queue/Queue';
import { usePathname } from 'next/navigation';




// Define the props for the DnDLayout component
interface DnDLayoutProps extends React.HTMLProps<HTMLDivElement> {
  hideFooter?: boolean,
  current: string;
  links?: Links[];
  hasLogin?: boolean;
  getCredits?: boolean;
  hasQueue?: boolean;
}

// Main DnDLayout component
const DnDLayout = ({ children, hideFooter, current, links, hasLogin = true, getCredits = false, hasQueue }: DnDLayoutProps) => {
  const { desktop } = useViewport();
  const dispatch = useDispatch();
  const showQueue = (desktop && useSelector(selectShowQueue))

  const mainClassNames = classNames(style.wrap, {
    'd-flex row g-0 max-screen': desktop && hasQueue,
    'queue-open': desktop && hasQueue && showQueue
  }
  )

  useEffect(() => {
    if (desktop && !showQueue) {
      dispatch(setShowQueue(true))
    }
  }, [desktop])

  const pathname = usePathname();
  return (
    <>
      <SessionProvider refetchOnWindowFocus refetchInterval={20 * 60}>
        <BrowserView>
          <DndProvider backend={HTML5Backend}>
            <Suspense>
              <Header current={current} links={links} hasLogin={hasLogin} getCredits={getCredits} hasQueue />
            </Suspense>
            <main className={mainClassNames}>
              <div className='col'>{children}</div>
              {(hasQueue && desktop && pathname !== '/queue') &&
                <Queue sidebar />}
            </main>
            {!hideFooter && <Footer current={current} />}
          </DndProvider>
        </BrowserView>
        <MobileView>
          <DndProvider backend={TouchBackend} options={{ ignoreContextMenu: true, enableMouseEvents: true }}>
            <Suspense>
              <Header current={current} links={links} hasLogin={hasLogin} getCredits={getCredits} hasQueue />
            </Suspense>
            <main className={style.wrap}>
              {children}
            </main>
            {!hideFooter && <Footer current={current} />}
          </DndProvider>
        </MobileView>
      </SessionProvider >
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" crossOrigin="anonymous" />
    </>
  );
}

export default DnDLayout;
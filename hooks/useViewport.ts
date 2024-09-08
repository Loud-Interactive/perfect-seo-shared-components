import { useEffect, useState } from 'react';

interface Viewports {
  phone: boolean;
  tablet: boolean;
  desktop: boolean;
  desktopxl: boolean;
  portrait: boolean;
}

const RESIZE_DELAY = 250;

const getViewports = (): Viewports => {
  if (typeof window === 'undefined') {
    return {
      phone: false,
      tablet: false,
      desktop: false,
      desktopxl: false,
      portrait: false,
    };
  }

  return {
    phone: window.innerWidth < 767,
    tablet: window.innerWidth >= 768 && window.innerWidth < 1025,
    desktop: window.innerWidth >= 1025,
    desktopxl: window.innerWidth >= 1200,
    portrait: window.matchMedia ? window.matchMedia('(orientation: portrait)').matches : false,
  };
};

export default function useViewport() {
  const [viewports, setViewports] = useState(getViewports());

  useEffect(() => {
    let resizeTimeout;

    function onResize() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => setViewports(getViewports()), RESIZE_DELAY);
    }

    window.addEventListener('resize', onResize, { capture: true, passive: true });

    return () => {
      clearTimeout(resizeTimeout);

      window.removeEventListener('resize', onResize);
    };
  }, []);

  return viewports;
}

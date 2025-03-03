import { useEffect, useMemo, useState } from 'react';

export default function usePwa() {
  const [isPwa, setIsPwa] = useState(false);

  const mediaWatcher = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)');
    }
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-pwa', isPwa ? 'true' : 'false');
  }, [isPwa]);

  //double hook for now
  const fsMediaWatcher = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: fullscreen)');
    }
  }, []);

  const getMediaType = () => {
    let nav: any = navigator;

    if (typeof window === 'undefined') {
      return setIsPwa(false);
    } else if (mediaWatcher.matches || nav?.standalone) {
      return setIsPwa(true);
    } else if (fsMediaWatcher.matches || nav?.fullscreen) {
      return setIsPwa(true);
    } else {
      return setIsPwa(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {

      getMediaType();
      mediaWatcher.addEventListener('change', getMediaType, { capture: true, passive: true });
    }
    mediaWatcher.removeEventListener('change', getMediaType);

  });

  return isPwa;
}
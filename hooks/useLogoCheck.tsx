import { useState, useEffect } from 'react';
import { updateImpression } from '../services/services';

const useLogoCheck = (logoUrl: string, domain) => {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogo = async () => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = logoUrl;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        const pixelCount = img.width * img.height;
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        setIsDark(brightness < 128);
      };

      img.onerror = () => {
        setIsDark(null);
      };
    };

    if (logoUrl) {
      checkLogo();
    }
    else {
      setIsDark(null);
    }
  }, [logoUrl]);

  useEffect(() => {
    if (isDark !== null && domain) {
      updateImpression(domain, { logo_theme: isDark ? 'dark' : 'light' })
    }
  }, [isDark, domain])

  return isDark;
};

export default useLogoCheck;
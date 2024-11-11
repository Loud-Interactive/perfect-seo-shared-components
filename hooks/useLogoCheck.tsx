import { useState, useEffect } from 'react';
import { updateImpression } from '../services/services';
import { FormController } from './useForm';
import axios from 'axios';

const blankData = { primaryColor: null, secondaryColor: null, isDark: null, width: null, height: null, aspectRatio: null }

const useLogoCheck = (logoUrl: string, domain: string, form?: FormController) => {
  const [data, setData] = useState(blankData);

  const checkForErrors = () => {
    axios.get(logoUrl)
      .catch((error) => {
        updateImpression(domain, { logo_url: null })
      });
  }

  useEffect(() => {
    const checkLogo = async () => {
      let newData = blankData;
      function rgbToHex(r, g, b) {
        return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
      }
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = logoUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return;
        newData.width = img.width
        newData.height = img.height
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        const colorCount = {};
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] === 0) continue; // Skip transparent pixels
          const rgb = `${data[i]},${data[i + 1]},${data[i + 2]}`;
          colorCount[rgb] = (colorCount[rgb] || 0) + 1;
        }



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
        const sortedColors = Object.entries(colorCount).sort((a, b) => Number(b[1]) - Number(a[1]));

        let secondaryColor = sortedColors[1] ? sortedColors[1][0].split(",") : null
        let primary = sortedColors[0][0].split(',')

        newData.primaryColor = rgbToHex(Number(primary[0]), Number(primary[1]), Number(primary[2]))
        newData.secondaryColor = secondaryColor ? rgbToHex(Number(secondaryColor[0]), Number(secondaryColor[1]), Number(secondaryColor[2])) : null
        newData.isDark = (brightness < 128);
      };

      setData(newData);
      img.onerror = () => {
        setData(blankData);
      };
    };

    if (logoUrl) {
      checkLogo();
      checkForErrors()
    }
    else {
      setData(blankData);
    }
  }, [logoUrl]);


  useEffect(() => {
    if (data && domain) {
      let newImpression: any = {}
      if (data.primaryColor && data.primaryColor !== form?.getState?.brand_color_primary) {
        newImpression.brand_color_primary = data.primaryColor
      }
      if (data.secondaryColor && data.secondaryColor !== form?.getState?.brand_color_primary) {
        newImpression.brand_color_secondary = data.secondaryColor
      }
      if (data.isDark !== null) {
        if (data.isDark && form?.getState?.logo_theme !== 'light') {
          newImpression.logo_theme = 'light'
        }
        else if (data.isDark === false && form?.getState?.logo_theme !== 'dark') {
          newImpression.logo_theme = 'dark'
        }
      }
      // if (data.width && Math.ceil(data?.width) !== form?.getState?.logo_width) {
      //   newImpression.logo_width = Math.ceil(data.width)
      // }
      // if (data.height && Math.ceil(data.height) !== form?.getState?.logo_height) {
      //   newImpression.logo_height = Math.ceil(data.height)
      // }
      if (Object?.keys(newImpression)?.length > 0) {
        updateImpression(domain, newImpression)
        if (form) {
          form.setState({ ...form.getState, ...newImpression })
        }
      }
    }

  }, [data, domain])

  return data?.isDark;
};

export default useLogoCheck;
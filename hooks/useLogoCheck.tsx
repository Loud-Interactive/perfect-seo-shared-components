import { useState, useEffect } from 'react';
import { updateImpression } from '../services/services';
import { FormController } from './useForm';
import axios from 'axios';

const blankData = { primaryColor: null, secondaryColor: null, isDark: null, width: null, height: null, aspectRatio: null };

const useLogoCheck = (logoUrl: string, domain: string, form?: FormController, synopsis?: any) => {
  const [data, setData] = useState(blankData);

  const checkForErrors = () => {
    axios.get(logoUrl)
      .catch((error) => {
        updateImpression(domain, { logo_url: null });
      });
  };

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  };

  const processImage = (img) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return blankData;
    const newData = { ...blankData };
    newData.width = Math.ceil(img.width).toString();
    newData.height = Math.ceil(img.height).toString();
    newData.aspectRatio = Math.ceil(img.width).toString() + ":" + Math.ceil(img.height).toString();
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
      if (data[i + 3] === 0) continue; // Skip transparent pixels
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
    let secondaryColor = sortedColors[1] ? sortedColors[1][0].split(",") : null;
    let primary = sortedColors[0][0].split(',');

    newData.primaryColor = rgbToHex(Number(primary[0]), Number(primary[1]), Number(primary[2]));
    newData.secondaryColor = secondaryColor ? rgbToHex(Number(secondaryColor[0]), Number(secondaryColor[1]), Number(secondaryColor[2])) : null;
    if (newData.primaryColor === '#ffffff' && newData.secondaryColor === '#fefefe') {
      newData.secondaryColor = '';
    }
    if (newData.primaryColor === newData.secondaryColor) {
      newData.secondaryColor = '';
    }
    newData.isDark = (brightness < 116);

    return newData;
  };



  useEffect(() => {
    const checkLogo = async () => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = logoUrl;
      img.onload = () => {
        const newData = processImage(img);
        setData(newData);
      };
      img.onerror = () => {
        setData(blankData);
      };
      // }
    };

    if (logoUrl) {
      checkLogo();
      checkForErrors();
    } else {
      setData(blankData);
    }
  }, [logoUrl]);

  useEffect(() => {
    if (data && domain) {
      let newImpression: any = {};

      let logo_width = form?.getState?.logo_width || synopsis?.logo_width;
      let logo_height = form?.getState?.logo_height || synopsis?.logo_height;
      let logo_aspect_ratio = form?.getState?.logo_aspect_ratio || synopsis?.logo_aspect_ratio;
      let brand_color_primary = form?.getState?.brand_color_primary || synopsis?.brand_color_primary;
      let brand_color_secondary = form?.getState?.brand_color_secondary || synopsis?.brand_color_secondary;
      let logo_theme = form?.getState?.logo_theme || synopsis?.logo_theme;
      if (data.width !== logo_width) {
        newImpression.logo_width = data.width
      }
      if (data.height !== logo_height) {
        newImpression.logo_height = data.height;
      }
      if (data.aspectRatio !== logo_aspect_ratio) {
        newImpression.logo_aspect_ratio = data.aspectRatio;
      }
      if (data.primaryColor && !brand_color_primary) {
        newImpression.brand_color_primary = data.primaryColor;
      }
      if (data.secondaryColor && !brand_color_secondary) {
        newImpression.brand_color_secondary = data.secondaryColor;
      }
      if (data.isDark !== null) {
        if (data.isDark && !logo_theme) {
          newImpression.logo_theme = 'light';
        } else if (data.isDark === false && !logo_theme) {
          newImpression.logo_theme = 'dark';
        }
      }
      if (Object.keys(newImpression).length > 0) {
        updateImpression(domain, newImpression)
        if (form) {
          form.setState({ ...form.getState, ...newImpression });
        }
      }
    }
  }, [data, domain]);

  return data.isDark;
};

export default useLogoCheck;
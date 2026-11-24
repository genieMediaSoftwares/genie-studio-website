import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BASE_URL from '../api';
import { usePublicData } from '../lib/publicData';

const PublicImages = createContext({});
const categories = {
  '/': 'homepage', '/about': 'about', '/portfolio': 'portfolio', '/blogs': 'blog',
  '/services': 'services_main', '/services/podcast-shoots': 'services_podcast',
  '/services/product-shoots': 'services_product', '/services/corporate-shoots': 'services_corporate',
  '/services/event-shoots': 'services_event', '/services/professional-shoots': 'services_professional',
  '/services/business-portfolio-shoots': 'services_business',
};

export function PublicImagesProvider({ children }) {
  const initial = usePublicData().sections || {};
  const [images, setImages] = useState(initial);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/site-sections`, { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (data?.map && typeof data.map === 'object') setImages(data.map);
      } catch { /* Retain existing genuine page images while the API is unavailable. */ }
    };
    refresh();
    window.addEventListener('genie-images-updated', refresh);
    return () => { controller.abort(); window.removeEventListener('genie-images-updated', refresh); };
  }, []);
  return <PublicImages.Provider value={images}>{children}</PublicImages.Provider>;
}

// Existing layouts keep their approved fallback images. Explicit keys disambiguate reused images.
// eslint-disable-next-line react-refresh/only-export-components -- This hook reads the provider defined in this module.
export function useAssignedImage(src, sectionKey) {
  const images = useContext(PublicImages);
  const { pathname } = useLocation();
  const matches = sectionKey ? [images[sectionKey]].filter(Boolean) : Object.values(images)
    .filter(row => row.category === categories[pathname] && row.default_image_url === src);
  if (!matches.length || new Set(matches.map(row => row.image_url)).size !== 1) return null;
  const image = matches[0];
  return image.image_url && /^https?:\/\//i.test(image.image_url) ? image : null;
}

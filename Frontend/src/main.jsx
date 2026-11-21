import { PublicImagesProvider } from "./context/PublicImages";
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { ThemeProvider } from "next-themes";

import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { PublicDataContext } from './lib/publicData'

const root = document.getElementById('root');
const initialData = JSON.parse(document.getElementById('genie-public-data')?.textContent || '{}');
const app = (
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
        <PublicDataContext.Provider value={initialData}><PublicImagesProvider><App /></PublicImagesProvider></PublicDataContext.Provider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);

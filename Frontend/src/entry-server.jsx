import { PublicImagesProvider } from "./context/PublicImages";
import React, { StrictMode } from 'react';
import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import App from './App';
import { PublicDataContext } from './lib/publicData';

// Render the actual route components, including lazy routes, without executing browser effects.
export function render(location, data = {}) {
  return new Promise((resolve, reject) => {
    let html = '';
    const output = new PassThrough();
    output.on('data', chunk => { html += chunk; });
    output.on('end', () => { clearTimeout(timer); resolve(html); });
    const stream = renderToPipeableStream(
      <StrictMode>
        <StaticRouter location={location}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <PublicDataContext.Provider value={data}><PublicImagesProvider><App /></PublicImagesProvider></PublicDataContext.Provider>
          </ThemeProvider>
        </StaticRouter>
      </StrictMode>,
      { onAllReady() { stream.pipe(output); }, onError(err) { clearTimeout(timer); reject(err); } },
    );
    const timer = setTimeout(() => { stream.abort(); reject(new Error(`Prerender timed out: ${location}`)); }, 30000);
  });
}

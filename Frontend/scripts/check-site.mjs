import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { createServer } from 'vite';
import { resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const htmlFiles = (await readdir(dist, { recursive: true })).map(file => file.split(sep).join('/'));
const publicRoutes = htmlFiles
  .filter(file => file.endsWith('.html') && file !== '404.html' && !/^admin(?:[/.]|$)/.test(file))
  .map(file => file === 'index.html' ? '/' : `/${file.slice(0, -5)}`);
assert(publicRoutes.length > 0, 'production build contains public HTML pages');
const robots = await readFile(resolve(dist, 'robots.txt'), 'utf8');
const report = { publicRoutes, indexable: !/^Disallow:\s*\/\s*$/im.test(robots) };
const canonicalPaths = new Set(report.publicRoutes);
let broken = 0;
for (const route of report.publicRoutes) {
  const file = resolve(dist, route === '/' ? 'index.html' : `${route.slice(1)}.html`);
  const html = await readFile(file, 'utf8');
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${route}: primary heading`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1, `${route}: canonical`);
  assert(!/<meta[^>]+name="keywords"/i.test(html), `${route}: obsolete keywords`);
  assert(html.includes('name="twitter:card"'), `${route}: Twitter card`);
  for (const [, json] of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    const schema = JSON.parse(json);
    assert(!JSON.stringify(schema).match(/aggregateRating|reviewCount/), `${route}: fabricated review schema`);
  }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    assert(/\balt=/.test(tag), `${route}: missing image alt attribute`);
    const src = tag.match(/\bsrc="(\/(?!\/)[^"]*)"/)?.[1];
    if (src) await access(resolve(dist, src.split(/[?#]/)[0].slice(1)));
  }
  for (const [, href] of html.matchAll(/<a\b[^>]*href="(\/(?!\/)[^"]*)"/g)) {
    const destination = href.split(/[?#]/)[0];
    if (canonicalPaths.has(destination) || destination.startsWith('/admin')) continue;
    try { await access(resolve(dist, destination.slice(1))); }
    catch { broken++; console.error(`Broken internal link: ${route} -> ${destination}`); }
  }
}
assert.equal(broken, 0, 'internal links');
const admin = await readFile(resolve(dist, 'admin.html'), 'utf8');
assert(admin.includes('noindex, follow'), 'admin indexing');
if (!report.indexable) {
  assert((await readFile(resolve(dist, 'robots.txt'), 'utf8')).includes('Disallow: /'));
  assert(!(await readFile(resolve(dist, 'sitemap.xml'), 'utf8')).includes('<loc>'));
}

// Test dynamic published content and injection handling in memory, without contacting an API.
const server = await createServer({ root, mode: 'production', configFile: false, css: { postcss: { plugins: [] } }, esbuild: { jsx: 'automatic' }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.jsx');
  const post = { title: 'Isolated render check', permalink: 'render-check', status: 'published',
    metaDescription: 'An isolated check of article metadata and safe rendering.',
    description: '<p>Published content</p><script>unsafe()</script>', createdAt: Date.UTC(2026, 0, 1) };
  const html = await render('/blog/render-check', { blog: post });
  assert(html.includes('Isolated render check | GenieStudio'));
  assert(html.includes('Published content'));
  assert(!html.includes('<script>unsafe()'));
  assert(html.includes('BlogPosting'));
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  const configured = await render('/', { sections: { home_hero_slide_1: {
    image_url: 'https://media.example.invalid/assigned-image.png', alt_text: 'Assigned studio image',
    category: 'homepage', default_image_url: 'unused',
  } } });
  assert(configured.includes('https://media.example.invalid/assigned-image.png'), 'admin image assignment reaches public markup');
  const slots = JSON.parse(await readFile(resolve(root, '../backend/data/siteSections.json'), 'utf8'));
  const assignments = Object.fromEntries(slots.filter(slot => slot.active !== false).map(slot => [slot.section_key, {
    ...slot, default_image_url: slot.image_url,
    image_url: `https://media.example.invalid/${slot.section_key}.png`, alt_text: 'Approved test image',
  }]));
  const categories = {
    '/': 'homepage', '/about': 'about', '/portfolio': 'portfolio',
    '/services/podcast-shoots': 'services_podcast', '/services/product-shoots': 'services_product',
    '/services/corporate-shoots': 'services_corporate', '/services/event-shoots': 'services_event',
    '/services/professional-shoots': 'services_professional', '/services/business-portfolio-shoots': 'services_business',
  };
  for (const [route, category] of Object.entries(categories)) {
    const rendered = await render(route, { sections: assignments });
    for (const slot of slots.filter(slot => slot.active !== false && slot.category === category)) {
      // Later carousel slides are selected by browser interaction, not the initial server render.
      if (['home_hero_slide_2', 'home_hero_slide_3'].includes(slot.section_key)) continue;
      assert(rendered.includes(assignments[slot.section_key].image_url), `${route}: ${slot.section_key} assignment`);
    }
  }
} finally { await server.close(); }
console.log(`Passed HTML, structured data, alt attributes, internal links, admin indexing, dynamic article, and image assignment checks for ${report.publicRoutes.length} public routes.`);

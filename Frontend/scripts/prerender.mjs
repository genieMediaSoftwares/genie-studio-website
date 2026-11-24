import { createServer, loadEnv } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const env = { ...loadEnv('production', root, ''), ...process.env };
const indexable = env.VITE_SITE_INDEXABLE === 'true';
const site = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '');
if (indexable && (!env.VITE_SITE_URL || new URL(site).protocol !== 'https:')) {
  throw new Error('Indexable builds require a confirmed HTTPS VITE_SITE_URL');
}
if (indexable && (!env.VITE_API_URL || new URL(env.VITE_API_URL).protocol !== 'https:')) {
  throw new Error('Indexable builds require a configured HTTPS VITE_API_URL');
}
const xmlEscape = value => String(value).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
const validSlug = value => typeof value === 'string' && value.length <= 255 && /^[a-z0-9]+(?:[a-z0-9_-]*[a-z0-9])?(?:\/[a-z0-9]+(?:[a-z0-9_-]*[a-z0-9])?)*$/i.test(value);

async function publicRows(endpoint) {
  const response = await fetch(`${env.VITE_API_URL.replace(/\/+$/, '')}${endpoint}`, { signal: AbortSignal.timeout(15000), redirect: 'error' });
  if (!response.ok) throw new Error(`Public content snapshot failed: ${endpoint} HTTP ${response.status}`);
  const data = await response.json();
  return Array.isArray(data) ? data : data.items;
}

let blogs = [], gallery = [], sections = {};
const fetchData = env.SEO_FETCH_PUBLIC_DATA === 'true';
if (indexable && !fetchData) throw new Error('Indexable releases require SEO_FETCH_PUBLIC_DATA=true to prerender current published content');
if (fetchData) {
  if (!env.VITE_API_URL) throw new Error('Public content snapshots require VITE_API_URL');
  const rows = await publicRows('/api/blogs');
  if (!Array.isArray(rows)) throw new Error('Published blogs API returned an invalid response');
  blogs = rows.filter(post => post.status === 'published' && validSlug(post.permalink));
  gallery = await publicRows('/api/gallery');
  const sectionResponse = await fetch(`${env.VITE_API_URL.replace(/\/+$/, '')}/api/site-sections`, { signal: AbortSignal.timeout(15000), redirect: 'error' });
  if (!sectionResponse.ok) throw new Error('Website image snapshot failed');
  sections = (await sectionResponse.json()).map || {};
  if (!Array.isArray(gallery)) throw new Error('Gallery API returned an invalid response');
}

const server = await createServer({ root, mode: 'production', configFile: false, css: { postcss: { plugins: [] } }, esbuild: { jsx: 'automatic' }, optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.jsx');
  const { ROUTES } = await server.ssrLoadModule('/src/lib/seoConfig.js');
  const template = (await readFile(resolve(root, 'dist/index.html'), 'utf8'))
    .replace(/<!--genie:head-->[\s\S]*?<!--\/genie:head-->/g, '')
    .replace(/<!--genie:body-->[\s\S]*?<!--\/genie:body-->/g, '<div id="root"></div>');
  const paths = [...ROUTES.map(route => route.path), ...blogs.map(post => `/blog/${post.permalink}`)];
  const titles = new Set(), descriptions = new Set();
  for (const route of [...paths, '/admin', '/admin/blogs', '/admin/images', '/admin/gallery', '/admin/portfolio', '/404']) {
    const data = {
      ...(fetchData ? { blogs, gallery, sections } : {}),
      ...(route.startsWith('/blog/') ? { blog: blogs.find(post => `/blog/${post.permalink}` === route) } : {}),
    };
    const rendered = await render(route, data);
    const head = [];
    const body = rendered.replace(/<title\b[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*>/gi, tag => { head.push(tag); return ''; });
    if (paths.includes(route)) {
      const title = head.find(tag => tag.startsWith('<title'));
      const description = head.find(tag => /name="description"/.test(tag));
      if (!title || !description || titles.has(title) || descriptions.has(description)) throw new Error(`Missing or duplicate SEO metadata at ${route}`);
      titles.add(title); descriptions.add(description);
      if ((body.match(/<h1\b/gi) || []).length !== 1) throw new Error(`Expected one H1 at ${route}`);
      for (const property of ['og:title', 'og:description', 'og:url', 'og:type', 'og:image']) {
        if (!head.some(tag => tag.includes(`property="${property}"`))) throw new Error(`Missing ${property} at ${route}`);
      }
    }
    const html = template.replace('</head>', `<!--genie:head-->${head.join('\n')}<!--/genie:head-->\n</head>`)
      .replace('<div id="root"></div>', `<!--genie:body--><div id="root">${body}</div><script id="genie-public-data" type="application/json">${safeJson(data)}</script><!--/genie:body-->`);
    const output = resolve(root, 'dist', route === '/' ? 'index.html' : route === '/404' ? '404.html' : `${route.slice(1)}.html`);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, html);
  }
  const urls = indexable ? paths : [];
  await writeFile(resolve(root, 'dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(route => `  <url><loc>${xmlEscape(site + route)}</loc></url>`).join('\n')}\n</urlset>\n`);
  await writeFile(resolve(root, 'dist/robots.txt'), indexable
    ? `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${site}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n');
  await writeFile(resolve(root, 'dist/llms.txt'), `# Genie Studio\n\n${indexable ? 'Public website' : 'Preview: indexing is disabled until the production domain is confirmed.'}\n\n${ROUTES.map(route => `- ${site}${route.path}`).join('\n')}\n`);
  // Old sitemap/feed files contained a previous domain and must not advertise stale URLs.
  for (const file of ['pages.xml', 'services.xml', 'categories.xml', 'tags.xml', 'feed.xml']) {
    await writeFile(resolve(root, 'dist', file), file === 'feed.xml'
      ? '<?xml version="1.0"?><rss version="2.0"><channel><title>Genie Studio</title><description>See the website blog for published articles.</description></channel></rss>'
      : '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
  }
  await writeFile(resolve(root, 'dist/seo-checks.json'), JSON.stringify({ publicRoutes: paths, indexable, blogSnapshot: fetchData, checks: ['unique titles', 'unique descriptions', 'one H1', 'Open Graph', 'static HTML'] }, null, 2));
  console.log(`Prerendered ${paths.length} public routes and private/error pages. Indexing ${indexable ? 'enabled' : 'disabled (unconfirmed release)'}.`);
} finally { await server.close(); }

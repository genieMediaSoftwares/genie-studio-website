# Genie Studio SEO

Public page metadata is centralized in `Frontend/src/lib/seoConfig.js`. `Seo.jsx` emits a unique title/description, canonical, robots directive, Open Graph, Twitter cards, existing business identity, page schema, and breadcrumbs. Service and article pages add their specific schema. No ratings, reviews, search action, awards, or new business details are invented.

`npm run build` prerenders the actual application into static HTML, so crawlers that do not run JavaScript can read page content and metadata. React hydrates this markup in the browser. An isolated script checks unique metadata, one H1 per public route, image alt attributes, valid JSON-LD, internal links, and dynamic article rendering.

The final production domain is unconfirmed. Previews default to `http://localhost:5173` canonical configuration, noindex metadata, blocking robots.txt, and an empty sitemap. Do not submit preview URLs to search engines. The fallback is a local preview address, not an invented production domain.

An indexable release requires confirmed HTTPS `VITE_SITE_URL`, HTTPS `VITE_API_URL`, `VITE_SITE_INDEXABLE=true`, and `SEO_FETCH_PUBLIC_DATA=true`. Published blog posts, gallery entries, and public image assignments are read from the configured API at build time. A failed content snapshot fails an indexable build. Sitemap entries include the 13 public routes and only published posts with safe permalinks. Admin/auth/draft/error routes are excluded.

Rebuild immediately after editing, publishing, unpublishing, or deleting public content. Static blog HTML and social metadata remain stale until replaced; unpublishing is not complete until the old static deployment/cache is invalidated. New blog URLs are not represented in static output until rebuilt. No automatic deployment was added.

Service pages use Service and BreadcrumbList schema; appropriate FAQ markup is retained from visible FAQs. About uses AboutPage, contact uses ContactPage, blogs use Blog/BlogPosting, portfolio retains CollectionPage, and home retains the existing Organization/LocalBusiness details. The provider identity consistently uses #business. There is no fabricated aggregate rating or non-existent site-search action.

Builds generate robots.txt, sitemap.xml, and llms.txt in dist using the configured release domain. Legacy source sitemap/feed copies are neutralized in build output to avoid advertising an old domain. Final Search Console inspection, social-preview testing, redirects from any old domain, domain ownership, and live indexing remain manual release tasks.

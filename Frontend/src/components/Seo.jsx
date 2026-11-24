import { SITE_NAME, DEFAULT_IMAGE, absolute, SITE_INDEXABLE, BUSINESS_SCHEMA } from "../lib/seoConfig";

export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  /** Set true on thin or duplicate pages that should stay out of the index. */
  noindex = false,
  /** Any extra schema.org object(s) to emit for this route. */
  schema,
  /** [{ name, path }] — rendered as BreadcrumbList, which Google shows in results. */
  breadcrumbs,
}) {
  const url = absolute(path);
  const serialize = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': path === '/about' ? 'AboutPage' : path === '/contact' ? 'ContactPage' : path === '/blogs' ? 'Blog' : 'WebPage',
    name: title, description, url, isPartOf: { '@id': absolute('/#website') },
    about: { '@id': absolute('/#business') },
  };

  const breadcrumbSchema = breadcrumbs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: crumb.name,
          item: absolute(crumb.path),
        })),
      }
    : null;

  return (
    <>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />

      {/* Overrides index.html's index,follow for pages that must not rank. */}
      <meta name="robots" content={noindex || !SITE_INDEXABLE ? 'noindex, follow' : 'index, follow, max-image-preview:large'} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={url} />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />

      {[BUSINESS_SCHEMA, pageSchema, ...(schema ? (Array.isArray(schema) ? schema : [schema]) : []), breadcrumbSchema]
        .filter(Boolean).map((entry, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(entry) }} />
        ))}
    </>
  );
}


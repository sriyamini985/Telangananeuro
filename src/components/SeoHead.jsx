import { useEffect } from 'react';

function upsertMeta(attrName, attrVal, content) {
  let el = document.head.querySelector(`meta[${attrName}="${attrVal}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function SeoHead({
  title,
  description,
  path = '/',
  type = 'website',
  image = '/assets/images/tns-logo.png',
}) {
  const siteName = 'Telangana Neurosciences Society';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Official Association Website`;
  const defaultDesc =
    'Official association website of the Telangana Neurosciences Society (TNS), uniting neurologists, neurosurgeons, and neuroscience researchers across Telangana.';
  const metaDesc = description || defaultDesc;
  const canonical = `https://www.telangananeuro.com${path}`;
  const imageUrl = image.startsWith('http') ? image : `https://www.telangananeuro.com${image}`;

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta('name', 'description', metaDesc);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', metaDesc);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', metaDesc);
    upsertMeta('name', 'twitter:image', imageUrl);

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);
  }, [fullTitle, metaDesc, canonical, type, imageUrl]);

  return null;
}

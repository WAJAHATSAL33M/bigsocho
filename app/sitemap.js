import posts from '../content/posts.json';
export default function sitemap(){const base=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';return ['','/about','/editorial-policy','/privacy','/contact',...posts.map(p=>`/articles/${p.slug}`)].map(path=>({url:base+path,lastModified:new Date('2026-10-03')}))}

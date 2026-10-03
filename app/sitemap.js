import {getPublishedPosts} from '../lib/github-content';
export const dynamic='force-dynamic';
export default async function sitemap(){const posts=await getPublishedPosts();const base=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';return [...['','/about','/editorial-policy','/privacy','/contact'].map(path=>({url:base+path,lastModified:new Date('2026-10-03')})),...posts.map(p=>({url:base+'/articles/'+p.slug,lastModified:new Date(p.updatedAt||p.publishedAt||'2026-10-03')}))]}

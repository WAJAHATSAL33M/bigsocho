'use client';
import {useState} from 'react';
import Link from 'next/link';
import Header from './Header';
import {arrangeFeed} from '../lib/post-validation.mjs';

export default function Journal({posts,categoryNames=[]}){
 const categories=['All ideas',...categoryNames];
 const [query,setQuery]=useState(''),[category,setCategory]=useState('All ideas');
 const visible=arrangeFeed(posts.filter(p=>(category==='All ideas'||p.category===category)&&[p.title,p.excerpt,p.category].join(' ').toLowerCase().includes(query.toLowerCase())));
 return <><Header><Link href="/" className="nav-link">Explore</Link><Link href="/about" className="nav-link">About</Link></Header><main><div className="intro"><div><div className="eyebrow">IDEAS FOR A LIFE WELL LIVED</div><h1>A little inspiration.<br/><em>Endless possibilities.</em></h1><p>Fresh perspectives on the spaces, places, and everyday moments we love.</p></div><label className="search"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find your next inspiration…" aria-label="Search articles"/></label></div><div className="toolbar"><div className="filters" aria-label="Article categories">{categories.map(c=><button key={c} className={c===category?'active':''} aria-pressed={c===category} onClick={()=>setCategory(c)}>{c}</button>)}</div><span className="count" aria-live="polite">{visible.length} curated stories</span></div><div className="grid">{visible.map((p,i)=><article key={p.slug} className={`card ${p.videoUrl?'video-card':''}`}><>{p.videoUrl?<div className="image-button video-cover"><video controls playsInline preload="none" poster={p.imageUrl||`/assets/${p.image}.jpg`} aria-label={p.title} src={p.videoUrl}/><span className="badge">{p.category} · Video</span></div>:<Link className="image-button" href={`/articles/${p.slug}`} aria-label={`Read ${p.title}`}><img src={p.imageUrl||`/assets/${p.image}.jpg`} alt={`Illustration for ${p.title}`} loading={i>3?'lazy':'eager'}/><span className="badge">{p.category}</span></Link>}</><div className="content"><Link className="title" title={p.title} href={`/articles/${p.slug}`}>{p.title}</Link></div></article>)}{visible.length===0&&<div className="empty">No stories found. Try another search or category.</div>}</div></main></>
}



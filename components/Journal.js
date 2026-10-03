'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import Header from './Header';
import CommentDialog from './CommentDialog';
import CopyPrompt from './CopyPrompt';
const categories=['All ideas','Home & living','Travel','Style','Food','Creativity'];
const iconPaths={heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',comment:'M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 1 1 17-5Z'};
function Icon({type}){return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={iconPaths[type]}/></svg>}
function stored(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(x=>typeof x==='string'):[]}catch{return []}}
export default function Journal({posts}){
 const [query,setQuery]=useState(''),[category,setCategory]=useState('All ideas'),[likes,setLikes]=useState([]),[commentPost,setCommentPost]=useState(null);
 useEffect(()=>{setLikes(stored('canvas-next-likes'))},[]);
 function toggle(slug){const next=likes.includes(slug)?likes.filter(x=>x!==slug):[...likes,slug];setLikes(next);try{localStorage.setItem('canvas-next-likes',JSON.stringify(next))}catch{}}
 const visible=posts.filter(p=>(category==='All ideas'||p.category===category)&&[p.title,p.excerpt,p.category].join(' ').toLowerCase().includes(query.toLowerCase()));
 return <><Header><Link href="/" className="nav-link">Explore</Link><Link href="/about" className="nav-link">About</Link></Header><main><div className="intro"><div><div className="eyebrow">IDEAS FOR A LIFE WELL LIVED</div><h1>A little inspiration.<br/><em>Endless possibilities.</em></h1><p>Fresh perspectives on the spaces, places, and everyday moments we love.</p></div><label className="search"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find your next inspiration…" aria-label="Search articles"/></label></div><div className="toolbar"><div className="filters" aria-label="Article categories">{categories.map(c=><button key={c} className={c===category?'active':''} aria-pressed={c===category} onClick={()=>setCategory(c)}>{c}</button>)}</div><span className="count" aria-live="polite">{visible.length} curated stories</span></div><div className="grid">{visible.map((p,i)=><article key={p.slug} className="card"><Link className="image-button" href={`/articles/${p.slug}`} aria-label={`Read ${p.title}`}><img src={p.imageUrl||`/assets/${p.image}.jpg`} alt={`Illustration for ${p.title}`} loading={i>3?'lazy':'eager'}/><span className="badge">{p.category}</span></Link><div className="content"><Link className="title" href={`/articles/${p.slug}`}>{p.title}</Link><div className="author"><span className="avatar">C</span>CREATACANVAS<span className="meta">{p.readingTime}</span></div><div className="actions card-social-actions"><button className={`icon-button heart-button ${likes.includes(p.slug)?'selected':''}`} title="Like" aria-label={`Like ${p.title}`} aria-pressed={likes.includes(p.slug)} onClick={()=>toggle(p.slug)}><Icon type="heart"/></button><button className="icon-button" title="Comment" aria-label={`Comment on ${p.title}`} onClick={()=>setCommentPost(p)}><Icon type="comment"/></button><CopyPrompt prompt={p.imagePrompt} title={p.title}/></div></div></article>)}{visible.length===0&&<div className="empty">No stories found. Try another search or category.</div>}</div></main>{commentPost&&<CommentDialog post={commentPost} onClose={()=>setCommentPost(null)}/>}</>
}



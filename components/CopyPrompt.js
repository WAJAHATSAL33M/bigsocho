'use client';
import {useEffect,useRef,useState} from 'react';
export default function CopyPrompt({prompt,title,showLabel=false}){
 const [notice,setNotice]=useState('');const timer=useRef(null);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const available=typeof prompt==='string'&&Boolean(prompt.trim());
 async function copy(){
  if(!available)return;
  clearTimeout(timer.current);
  try{await navigator.clipboard.writeText(prompt);setNotice('Prompt copied.')}catch{window.prompt('Copy this image-generation prompt:',prompt);setNotice('Select and copy the prompt.');}
  timer.current=setTimeout(()=>setNotice(''),3000);
 }
 return <div className="copy-prompt-control"><button type="button" className="icon-button" disabled={!available} title={available?'Copy image-generation prompt':'No image-generation prompt added'} aria-label={`Copy image-generation prompt for ${title}`} onClick={copy}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>{showLabel&&'Copy prompt'}</button>{notice&&<span className="prompt-feedback" role="status">{notice}</span>}</div>
}

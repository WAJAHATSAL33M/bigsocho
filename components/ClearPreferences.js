'use client';
import {useState} from 'react';
export default function ClearPreferences(){const [message,setMessage]=useState('');return <div><button className="storage-button" onClick={()=>{try{['canvas-next-saved','canvas-next-likes','canvas-next-dislikes','canvas-saved','canvas-likes'].forEach(k=>localStorage.removeItem(k));setMessage('Reactions cleared in this browser.')}catch{setMessage('Please clear this site’s data in your browser settings.')}}}>Clear likes</button><p role="status">{message}</p></div>}

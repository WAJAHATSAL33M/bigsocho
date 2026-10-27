import {RequestError} from './errors.mjs';
import {randomUUID} from 'node:crypto';
export function validateComment(input,now=new Date()){
 if(!input||typeof input.name!=='string'||typeof input.text!=='string'||typeof input.slug!=='string')throw new RequestError('Enter your name and comment.');
 const name=input.name.trim(),text=input.text.trim(),slug=input.slug;
 if(name.length<2||name.length>60)throw new RequestError('Use a name between 2 and 60 characters.');
 if(text.length<5||text.length>2000)throw new RequestError('Comments must be between 5 and 2,000 characters.');
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new RequestError('This article is unavailable.');
 if(input.website)throw new RequestError('Comment could not be submitted.');
 return {id:randomUUID(),slug,name,text,status:'pending',createdAt:now.toISOString()};
}
export function visibleComments(comments,slug){return comments.filter(c=>c.status==='approved'&&c.slug===slug).map(({id,name,text,createdAt})=>({id,name,text,createdAt}))}

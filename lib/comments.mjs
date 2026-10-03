import {randomUUID} from 'node:crypto';
export function validateComment(input,now=new Date()){
 if(!input||typeof input.name!=='string'||typeof input.text!=='string'||typeof input.slug!=='string')throw Error('Enter your name and comment.');
 const name=input.name.trim(),text=input.text.trim(),slug=input.slug;
 if(name.length<2||name.length>60)throw Error('Use a name between 2 and 60 characters.');
 if(text.length<5||text.length>2000)throw Error('Comments must be between 5 and 2,000 characters.');
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error('This article is unavailable.');
 if(input.website)throw Error('Comment could not be submitted.');
 return {id:randomUUID(),slug,name,text,status:'pending',createdAt:now.toISOString()};
}
export function visibleComments(comments,slug){return comments.filter(c=>c.status==='approved'&&c.slug===slug).map(({id,name,text,createdAt})=>({id,name,text,createdAt}))}

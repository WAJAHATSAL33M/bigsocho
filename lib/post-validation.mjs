import {RequestError} from './errors.mjs';
export const categories=['Home & living','Travel','Style','Food','Creativity','Inspiration'];
export const images=['home','travel','style','food','architecture','sunset','flower','city'];
function field(value,name,max,required=true){if(typeof value!=='string')throw new RequestError(`${name} is required.`);const result=value.trim();if(required&&!result)throw new RequestError(`${name} is required.`);if(result.length>max)throw new RequestError(`${name} must be ${max} characters or fewer.`);return result}
export function validatePost(input,existing=null,now=new Date(),allowedCategories=categories){
 if(!input||typeof input!=='object'||Array.isArray(input))throw new RequestError('Post data is missing.');
 const title=field(input.title,'Title',160),slug=field(input.slug,'URL slug',100);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new RequestError('Use lowercase letters, numbers and single hyphens in the URL slug.');
 if(existing&&existing.slug!==slug)throw new RequestError('Published URL slugs cannot be changed.');
 if(!allowedCategories.includes(input.category))throw new RequestError('Choose a valid category.');
 const excerpt=field(input.excerpt,'Excerpt',320);if(!['draft','published'].includes(input.status))throw new RequestError('Choose draft or published.');
 let imageUrl=field(input.imageUrl||'','Cover image URL',2048,false);if(imageUrl&&!/^\/api\/media\/[a-f0-9-]{36}$/.test(imageUrl)){let url;try{url=new URL(imageUrl)}catch{throw new RequestError('Use a valid HTTPS image URL.')}if(url.protocol!=='https:'||url.username||url.password)throw new RequestError('Use a valid HTTPS image URL without credentials.');imageUrl=url.href}
 let videoUrl=field(input.videoUrl??'','Video URL',2048,false);if(videoUrl){let url;try{url=new URL(videoUrl)}catch{throw new RequestError('Use a valid HTTPS video URL.')}if(url.protocol!=='https:'||url.username||url.password)throw new RequestError('Use a valid HTTPS video URL without credentials.');if(!/\.(mp4|webm)$/i.test(url.pathname))throw new RequestError('Use a direct MP4 or WebM video URL.');videoUrl=url.href}
 const imagePrompt=input.imagePrompt??'';if(typeof imagePrompt!=='string')throw new RequestError('Image-generation prompt must be text.');if(imagePrompt.length>12000)throw new RequestError('Image-generation prompt must be 12000 characters or fewer.');
 if(!images.includes(input.image))throw new RequestError('Choose a cover image.');
 if(!Array.isArray(input.sections)||!input.sections.length||input.sections.length>40)throw new RequestError('Add between 1 and 40 article sections.');
 const sections=input.sections.map(s=>{if(!s||typeof s!=='object'||Array.isArray(s))throw new RequestError('Each section must contain a heading and text.');return {heading:field(s.heading,'Section heading',180),text:field(s.text,'Section text',12000)}});
 const words=sections.reduce((sum,s)=>sum+s.text.split(/\s+/).length,0);const today=now.toISOString().slice(0,10);
 return {slug,title,category:input.category,excerpt,image:input.image,imageUrl,imagePrompt,videoUrl,status:input.status,sections,readingTime:`${Math.max(1,Math.ceil(words/200))} min read`,publishedAt:existing?.publishedAt||(existing&&existing.status===undefined?'2026-10-03':null)||(input.status==='published'?today:null),updatedAt:today};
}
export function publicPosts(posts){return posts.filter(p=>p.status===undefined||p.status==='published')}

export function arrangeFeed(posts){
 const cards=posts.filter(p=>!p.videoUrl),videos=posts.filter(p=>p.videoUrl),result=[];
 let card=0,video=0;
 while(card<cards.length||video<videos.length){
  result.push(...cards.slice(card,card+2));card+=2;
  if(video<videos.length)result.push(videos[video++]);
 }
 return result;
}

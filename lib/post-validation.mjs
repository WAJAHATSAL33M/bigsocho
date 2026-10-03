export const categories=['Home & living','Travel','Style','Food','Creativity'];
export const images=['home','travel','style','food','architecture','sunset','flower','city'];
function field(value,name,max,required=true){if(typeof value!=='string')throw Error(`${name} is required.`);const result=value.trim();if(required&&!result)throw Error(`${name} is required.`);if(result.length>max)throw Error(`${name} must be ${max} characters or fewer.`);return result}
export function validatePost(input,existing=null,now=new Date()){
 if(!input||typeof input!=='object')throw Error('Post data is missing.');
 const title=field(input.title,'Title',160),slug=field(input.slug,'URL slug',100);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error('Use lowercase letters, numbers and single hyphens in the URL slug.');
 if(existing&&existing.slug!==slug)throw Error('Published URL slugs cannot be changed.');
 if(!categories.includes(input.category))throw Error('Choose a valid category.');
 const excerpt=field(input.excerpt,'Excerpt',320);if(!['draft','published'].includes(input.status))throw Error('Choose draft or published.');
 let imageUrl=field(input.imageUrl||'','Cover image URL',2048,false);if(imageUrl){let url;try{url=new URL(imageUrl)}catch{throw Error('Use a valid HTTPS image URL.')}if(url.protocol!=='https:'||url.username||url.password)throw Error('Use a valid HTTPS image URL without credentials.');imageUrl=url.href}
 if(!images.includes(input.image))throw Error('Choose a cover image.');
 if(!Array.isArray(input.sections)||!input.sections.length||input.sections.length>40)throw Error('Add between 1 and 40 article sections.');
 const sections=input.sections.map(s=>({heading:field(s.heading,'Section heading',180),text:field(s.text,'Section text',12000)}));
 const words=sections.reduce((sum,s)=>sum+s.text.split(/\s+/).length,0);const today=now.toISOString().slice(0,10);
 return {slug,title,category:input.category,excerpt,image:input.image,imageUrl,status:input.status,sections,readingTime:`${Math.max(1,Math.ceil(words/200))} min read`,publishedAt:existing?.publishedAt||(existing&&existing.status===undefined?'2026-10-03':null)||(input.status==='published'?today:null),updatedAt:today};
}
export function publicPosts(posts){return posts.filter(p=>p.status===undefined||p.status==='published')}

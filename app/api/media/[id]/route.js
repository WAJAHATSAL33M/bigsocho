import {consumeRateLimit,limited} from '../../../../lib/rate-limit.mjs';
import {database,readDocument} from '../../../../lib/database.mjs';
import {authenticated} from '../../../../lib/auth';
import {publicPosts} from '../../../../lib/post-validation.mjs';
export const runtime='nodejs';
export async function GET(request,{params}){
 const {id}=await params;if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
 try{
 const isAdmin=await authenticated();
 if(!isAdmin){const rate=await consumeRateLimit('public-media',1200,60000);if(!rate.allowed)return limited(rate.retryAfter)}
 if(!isAdmin){const {value}=await readDocument('posts');if(!publicPosts(value).some(p=>p.imageUrl===`/api/media/${id}`))return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}})}
 const [rows]=await database().execute('SELECT mime,bytes FROM canvas_media WHERE id=?',[id]);if(!rows.length||!['image/png','image/jpeg','image/webp'].includes(rows[0].mime))return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
 return new Response(new Uint8Array(rows[0].bytes),{headers:{'Content-Type':rows[0].mime,'Cache-Control':'private,no-store','Vary':'Cookie','Cross-Origin-Resource-Policy':'same-origin','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('Media unavailable',{status:503})}
}

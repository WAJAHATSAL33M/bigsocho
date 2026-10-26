import {database,readDocument} from '../../../../lib/database.mjs';
import {authenticated} from '../../../../lib/auth';
import {publicPosts} from '../../../../lib/post-validation.mjs';
export const runtime='nodejs';
export async function GET(request,{params}){
 const {id}=await params;if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Not found',{status:404});
 try{
 const isAdmin=await authenticated();
 if(!isAdmin){const {value}=await readDocument('posts');if(!publicPosts(value).some(p=>p.imageUrl===`/api/media/${id}`))return new Response('Not found',{status:404})}
 const [rows]=await database().execute('SELECT mime,bytes FROM canvas_media WHERE id=?',[id]);if(!rows.length)return new Response('Not found',{status:404});
 return new Response(new Uint8Array(rows[0].bytes),{headers:{'Content-Type':rows[0].mime,'Cache-Control':isAdmin?'private,no-store':'public,max-age=0,must-revalidate','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('Media unavailable',{status:503})}
}

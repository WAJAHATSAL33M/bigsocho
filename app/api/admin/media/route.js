import {randomUUID} from 'node:crypto';
import {requireAdmin,authenticated} from '../../../../lib/auth';
import {database,databaseFailure} from '../../../../lib/database.mjs';
import {MAX_IMAGE_BYTES,validateImage} from '../../../../lib/media.mjs';
export const runtime='nodejs';
export async function GET(){if(!await authenticated())return Response.json({error:'Please sign in again.'},{status:401});try{const [rows]=await database().execute('SELECT id,name,mime,OCTET_LENGTH(bytes) AS size FROM canvas_media ORDER BY created_at DESC LIMIT 100');return Response.json({media:rows.map(r=>({...r,url:`/api/media/${r.id}`}))},{headers:{'Cache-Control':'no-store'}})}catch(error){return Response.json({error:databaseFailure(error)},{status:503})}}
export async function POST(request){const denied=await requireAdmin(request);if(denied)return denied;try{
 // Raw image body is streamed with a hard cap, including chunked requests.
 if(Number(request.headers.get('content-length'))>MAX_IMAGE_BYTES)return Response.json({error:'Images must be no larger than 2 MB.'},{status:413});
 const reader=request.body?.getReader();if(!reader)throw Error('Choose an image.');let size=0;const chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_IMAGE_BYTES){await reader.cancel();return Response.json({error:'Images must be no larger than 2 MB.'},{status:413})}chunks.push(Buffer.from(value))}
 const bytes=Buffer.concat(chunks),mime=validateImage(bytes),id=randomUUID();const name=(request.headers.get('x-file-name')||'image').replace(/[^a-zA-Z0-9._ -]/g,'').slice(0,160)||'image';
 await database().execute('INSERT INTO canvas_media (id,name,mime,bytes) VALUES (?,?,?,?)',[id,name,mime,bytes]);return Response.json({media:{id,name,mime,url:`/api/media/${id}`}},{status:201});
 }catch(error){return Response.json({error:error.code?databaseFailure(error):error.message},{status:error.code?503:400})}}

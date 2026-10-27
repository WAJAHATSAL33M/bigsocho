import {randomUUID} from 'node:crypto';
import {requireAdmin,requireAdminRead} from '../../../../lib/auth';
import {database,databaseFailure} from '../../../../lib/database.mjs';
import {MAX_IMAGE_BYTES,normalizeImage} from '../../../../lib/media.mjs';
import {readBody,clientError} from '../../../../lib/request.mjs';
import {consumeRateLimit,limited} from '../../../../lib/rate-limit.mjs';
export const runtime='nodejs';
export async function GET(){const denied=await requireAdminRead();if(denied)return denied;try{const [rows]=await database().execute('SELECT id,name,mime,OCTET_LENGTH(bytes) AS size FROM canvas_media ORDER BY created_at DESC LIMIT 100');return Response.json({media:rows.map(r=>({...r,url:`/api/media/${r.id}`}))},{headers:{'Cache-Control':'no-store'}})}catch(error){return Response.json({error:databaseFailure(error)},{status:503})}}
export async function POST(request){const denied=await requireAdmin(request);if(denied)return denied;try{
 const rate=await consumeRateLimit('image-upload',20,900000);if(!rate.allowed)return limited(rate.retryAfter);
 if(request.headers.get('content-type')?.split(';')[0]!=='application/octet-stream')return Response.json({error:'Upload a raw image body.'},{status:415});
 const {bytes,mime}=await normalizeImage(await readBody(request,MAX_IMAGE_BYTES)),id=randomUUID();
 const name=(request.headers.get('x-file-name')||'image').replace(/[^a-zA-Z0-9._ -]/g,'').slice(0,150).replace(/\.[^.]*$/,'')+'.webp';
 await database().execute('INSERT INTO canvas_media (id,name,mime,bytes) VALUES (?,?,?,?)',[id,name,mime,bytes]);return Response.json({media:{id,name,mime,url:`/api/media/${id}`}},{status:201});
 }catch(error){return clientError(error,'Unable to upload this image.')}}

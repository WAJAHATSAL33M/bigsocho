import {clientError} from '../../../../lib/request.mjs';
import {databaseFailure} from '../../../../lib/database.mjs';
import {requireAdminRead,requireAdmin,readJson} from '../../../../lib/auth';
import {readComments,changeComments} from '../../../../lib/db-comments';
export async function GET(){const denied=await requireAdminRead();if(denied)return denied;try{return Response.json({comments:(await readComments()).comments},{headers:{'Cache-Control':'no-store'}})}catch(e){return Response.json({error:databaseFailure(e)},{status:503})}}
export async function POST(request){const denied=await requireAdmin(request);if(denied)return denied;try{const input=await readJson(request);if(!['approved','rejected'].includes(input.status)||typeof input.id!=='string')return Response.json({error:'Choose approve or reject.'},{status:400});const comments=await changeComments(items=>{if(!items.some(c=>c.id===input.id))throw Error('Comment not found.');return items.map(c=>c.id===input.id?{...c,status:input.status}:c)},`${input.status==='approved'?'Approve':'Reject'} comment`);return Response.json({comments})}catch(e){return clientError(e)}}

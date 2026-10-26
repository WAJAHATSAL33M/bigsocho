import {authenticated,requireAdmin,readJson} from '../../../../lib/auth';
import {readRepository,savePost} from '../../../../lib/content';
import {databaseFailure} from '../../../../lib/database.mjs';
export const runtime='nodejs';
export async function GET(){if(!await authenticated())return Response.json({error:'Please sign in again.'},{status:401});try{const {posts,sha,categories}=await readRepository();return Response.json({posts,revision:sha,categories},{headers:{'Cache-Control':'no-store'}})}catch(error){return Response.json({error:databaseFailure(error)},{status:503})}}
export async function POST(request){const denied=await requireAdmin(request);if(denied)return denied;try{return Response.json(await savePost(await readJson(request)),{headers:{'Cache-Control':'no-store'}})}catch(error){return Response.json({error:error.code?databaseFailure(error):error.message},{status:error.status||(error.code?503:400)})}}

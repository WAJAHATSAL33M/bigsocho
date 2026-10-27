import {clientError} from '../../../../lib/request.mjs';
import {requireAdmin,readJson} from '../../../../lib/auth';
import {changeCategory} from '../../../../lib/content';
import {databaseFailure} from '../../../../lib/database.mjs';
export async function POST(request){const denied=await requireAdmin(request);if(denied)return denied;try{return Response.json({categories:await changeCategory(await readJson(request,4096))})}catch(error){return clientError(error)}}

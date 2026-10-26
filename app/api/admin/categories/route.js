import {requireAdmin,readJson} from '../../../../lib/auth';
import {changeCategory} from '../../../../lib/content';
import {databaseFailure} from '../../../../lib/database.mjs';
export async function POST(request){const denied=await requireAdmin(request);if(denied)return denied;try{return Response.json({categories:await changeCategory(await readJson(request))})}catch(error){return Response.json({error:error.code?databaseFailure(error):error.message},{status:error.status||(error.code?503:400)})}}

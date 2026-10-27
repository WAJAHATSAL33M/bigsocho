import {clientError} from '../../../../lib/request.mjs';
import {requireAdminRead} from '../../../../lib/auth';
import {database,databaseFailure} from '../../../../lib/database.mjs';
export async function GET(){const denied=await requireAdminRead();if(denied)return denied;try{await database().execute('SELECT name FROM canvas_documents WHERE name=?',['posts']);const [audit]=await database().execute('SELECT action,target,created_at FROM canvas_audit ORDER BY id DESC LIMIT 12');return Response.json({database:'connected',audit},{headers:{'Cache-Control':'no-store'}})}catch(error){return Response.json({error:databaseFailure(error)},{status:503})}}

import {cookies} from 'next/headers';
import {configured,validPassword,validEmail,createSession,COOKIE,trustedOrigin,cookieOptions} from '../../../../lib/security.mjs';
import {readJson,clientError} from '../../../../lib/request.mjs';
import {databaseConfigured} from '../../../../lib/database.mjs';
import {reserveLoginAttempt} from '../../../../lib/login-limit.mjs';
import {issueSession} from '../../../../lib/sessions.mjs';
export const runtime='nodejs';
export async function POST(request){
 if(!trustedOrigin(request))return Response.json({error:'Request origin is not allowed.'},{status:403});
 if(!configured()||!databaseConfigured())return Response.json({error:'Private access is unavailable. Contact the site owner.'},{status:503});
 try{
 if(!await reserveLoginAttempt())return Response.json({error:'Too many sign-in attempts. Try again in 15 minutes.'},{status:429,headers:{'Retry-After':'900'}});
 const input=await readJson(request,2048);const passwordOK=await validPassword(input.password);
 if(!validEmail(input.email)||!passwordOK)return Response.json({error:'Email or password is incorrect.'},{status:401});
 const token=createSession();await issueSession(token);(await cookies()).set(COOKIE,token,cookieOptions());
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch(error){if(error.status)return clientError(error);console.error('Login failed:',error.code||error.name);return Response.json({error:'Sign-in unavailable. Please try again later.'},{status:503})}
}

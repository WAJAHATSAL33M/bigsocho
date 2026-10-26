import {cookies} from 'next/headers';
import {configured,validPassword,validEmail,createSession,COOKIE,SESSION_SECONDS,trustedOrigin} from '../../../../lib/security.mjs';
import {readJson} from '../../../../lib/auth';
import {databaseConfigured} from '../../../../lib/database.mjs';
import {reserveLoginAttempt} from '../../../../lib/login-limit.mjs';
export const runtime='nodejs';
export async function POST(request){
 if(!trustedOrigin(request))return Response.json({error:'Request origin is not allowed.'},{status:403});
 if(!configured()||!databaseConfigured())return Response.json({error:'Private admin access needs configuration. Follow HOSTINGER.md.'},{status:503});
 try{
 if(!await reserveLoginAttempt())return Response.json({error:'Too many sign-in attempts. Try again in 15 minutes.'},{status:429});
 const input=await readJson(request);const passwordOK=await validPassword(input.password);
 if(!validEmail(input.email)||!passwordOK)return Response.json({error:'Email or password is incorrect.'},{status:401});
 (await cookies()).set(COOKIE,createSession(),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:SESSION_SECONDS});
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch(error){console.error('Login failed:',error.code||error.name);return Response.json({error:'Sign-in unavailable. Check the database setup.'},{status:503})}
}

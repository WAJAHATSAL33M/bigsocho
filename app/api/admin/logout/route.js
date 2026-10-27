import {cookies} from 'next/headers';
import {COOKIE,trustedOrigin,cookieOptions,validSession} from '../../../../lib/security.mjs';
import {revokeSession} from '../../../../lib/sessions.mjs';
export async function POST(request){if(!trustedOrigin(request))return Response.json({error:'Request origin is not allowed.'},{status:403});const jar=await cookies(),token=jar.get(COOKIE)?.value;try{if(validSession(token))await revokeSession(token);jar.set(COOKIE,'',{...cookieOptions(),maxAge:0});return Response.json({ok:true})}catch(error){console.error('Session revocation failed:',error.code||error.name);jar.set(COOKIE,'',{...cookieOptions(),maxAge:0});return Response.json({error:'Sign-out could not be confirmed. Please try again.'},{status:503})}}

import {cookies} from 'next/headers';
import {COOKIE,trustedOrigin} from './security.mjs';
import {sessionActive} from './sessions.mjs';
import {consumeRateLimit,limited} from './rate-limit.mjs';
export {readJson} from './request.mjs';
export async function authenticated(){try{return await sessionActive((await cookies()).get(COOKIE)?.value)}catch(error){console.error('Session unavailable:',error.code||error.name);return false}}
export async function requireAdmin(request){if(!trustedOrigin(request))return Response.json({error:'Request origin is not allowed.'},{status:403});if(!await authenticated())return Response.json({error:'Please sign in again.'},{status:401});try{const rate=await consumeRateLimit('admin-write',120,60000);if(!rate.allowed)return limited(rate.retryAfter)}catch{return Response.json({error:'Service unavailable.'},{status:503})}return null}
export async function requireAdminRead(){if(!await authenticated())return Response.json({error:'Please sign in again.'},{status:401});try{const rate=await consumeRateLimit('admin-read',240,60000);if(!rate.allowed)return limited(rate.retryAfter)}catch{return Response.json({error:'Service unavailable.'},{status:503})}return null}

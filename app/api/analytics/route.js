import {cookies} from 'next/headers';
import {randomUUID} from 'node:crypto';
import {trustedOrigin,siteOrigin} from '../../../lib/security.mjs';
import {authenticated} from '../../../lib/auth';
import {readJson,clientError} from '../../../lib/request.mjs';
import {databaseConfigured} from '../../../lib/database.mjs';
import {getPublishedPosts} from '../../../lib/content';
import {consumeRateLimit,limited} from '../../../lib/rate-limit.mjs';
import {CONSENT_COOKIE,VISITOR_COOKIE,VISIT_COOKIE,decodeConsent,preferenceOptions,privacySignal,clearAnalyticsCookies} from '../../../lib/consent.mjs';
import {UUID,validatePageview,analyticsDigest,knownBot} from '../../../lib/analytics.mjs';
import {recordPageview,limitAnalyticsBrowser} from '../../../lib/analytics-db.mjs';
export const runtime='nodejs';
export async function POST(request){if(!trustedOrigin(request))return Response.json({error:'Request origin is not allowed.'},{status:403});const jar=await cookies();if(decodeConsent(jar.get(CONSENT_COOKIE)?.value).choice!=='analytics'||privacySignal(request.headers)){if(jar.has(VISITOR_COOKIE)||jar.has(VISIT_COOKIE))clearAnalyticsCookies(jar);return new Response(null,{status:204})}if(!databaseConfigured())return new Response(null,{status:503});if(knownBot(request.headers.get('user-agent'))||await authenticated())return new Response(null,{status:204});try{
 const globalRate=await consumeRateLimit('analytics-global',5000,60000);if(!globalRate.allowed)return limited(globalRate.retryAfter);
 const event=validatePageview(await readJson(request,4096),siteOrigin());
 if(event.postSlug&&!(await getPublishedPosts()).some(p=>p.slug===event.postSlug))return Response.json({error:'Article not found.'},{status:404});
 const visitorCookie=jar.get(VISITOR_COOKIE)?.value,visitCookie=jar.get(VISIT_COOKIE)?.value;
 const visitor=UUID.test(visitorCookie||'')?visitorCookie:randomUUID(),visit=UUID.test(visitCookie||'')?visitCookie:randomUUID();
 const visitorHash=analyticsDigest('visitor',visitor),visitHash=analyticsDigest('visit',visit);
 const rate=await limitAnalyticsBrowser(visitorHash);if(!rate.allowed)return limited(rate.retryAfter);
 await recordPageview(event,visitorHash,visitHash);
 if(visitor!==visitorCookie)jar.set(VISITOR_COOKIE,visitor,{...preferenceOptions(),maxAge:30*24*60*60});
 jar.set(VISIT_COOKIE,visit,{...preferenceOptions(),maxAge:30*60});
 return new Response(null,{status:204,headers:{'Cache-Control':'private,no-store'}});
 }catch(error){return clientError(error,'Pageview could not be recorded.')}}

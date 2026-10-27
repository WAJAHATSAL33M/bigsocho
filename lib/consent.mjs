import {createHmac,timingSafeEqual} from 'node:crypto';
export const CONSENT_VERSION='2026-10-27';
export const CONSENT_SECONDS=180*24*60*60;
const prefix=process.env.NODE_ENV==='production'?'__Host-':'';
export const CONSENT_COOKIE=prefix+'canvas-consent';
export const VISITOR_COOKIE=prefix+'canvas-visitor';
export const VISIT_COOKIE=prefix+'canvas-visit';
export function privacySignal(headers){return headers.get('sec-gpc')==='1'||headers.get('dnt')==='1'}
export function consentConfigured(){return (process.env.SESSION_SECRET?.length||0)>=32}
export function preferenceOptions(){return {httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:CONSENT_SECONDS}}
const sign=value=>createHmac('sha256',process.env.SESSION_SECRET).update(`cookie-consent:${value}`).digest('base64url');
export function encodeConsent(choice,now=Date.now()){if(!['essential','analytics'].includes(choice))throw Error('Invalid choice.');if(!consentConfigured()){if(choice==='essential')return 'essential-only';throw Error('Analytics is unavailable.')}const payload=Buffer.from(JSON.stringify({version:CONSENT_VERSION,choice,at:now})).toString('base64url');return payload+'.'+sign(payload)}
export function decodeConsent(token,now=Date.now()){if(token==='essential-only')return {choice:'essential',at:0};if(!consentConfigured()||typeof token!=='string'||token.length>600)return {choice:'unknown'};try{const [payload,signature,...rest]=token.split('.');if(rest.length||!payload||!signature)return {choice:'unknown'};const a=Buffer.from(signature),b=Buffer.from(sign(payload));if(a.length!==b.length||!timingSafeEqual(a,b))return {choice:'unknown'};const value=JSON.parse(Buffer.from(payload,'base64url').toString());if(value.version!==CONSENT_VERSION||!['essential','analytics'].includes(value.choice)||!Number.isFinite(value.at)||value.at>now||now-value.at>CONSENT_SECONDS*1000)return {choice:'unknown'};return {choice:value.choice,at:value.at}}catch{return {choice:'unknown'}}}
export function clearAnalyticsCookies(jar){for(const name of [VISITOR_COOKIE,VISIT_COOKIE])jar.set(name,'',{...preferenceOptions(),maxAge:0})}

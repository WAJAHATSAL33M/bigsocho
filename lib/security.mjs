import {createHmac,createHash,timingSafeEqual} from 'node:crypto';
export const COOKIE='canvas-admin';
export const SESSION_SECONDS=60*60*8;
export function configured(){return !!(process.env.ADMIN_PASSWORD?.length>=12&&process.env.SESSION_SECRET?.length>=32)}
function sign(value){return createHmac('sha256',process.env.SESSION_SECRET).update(value).digest('base64url')}
function passwordVersion(){return createHash('sha256').update(process.env.ADMIN_PASSWORD||'').digest('hex')}
export function validPassword(value){if(!configured()||typeof value!=='string'||value.length>1024)return false;const hash=v=>createHmac('sha256',process.env.SESSION_SECRET).update(v).digest();return timingSafeEqual(hash(value),hash(process.env.ADMIN_PASSWORD))}
export function createSession(now=Date.now()){if(!configured())throw Error('Admin login is not configured.');const payload=Buffer.from(JSON.stringify({expires:now+SESSION_SECONDS*1000,version:passwordVersion()})).toString('base64url');return payload+'.'+sign(payload)}
export function validSession(token,now=Date.now()){if(!configured()||typeof token!=='string'||token.length>1024)return false;try{const [payload,signature,...rest]=token.split('.');if(rest.length||!payload||!signature)return false;const a=Buffer.from(signature),b=Buffer.from(sign(payload));if(a.length!==b.length||!timingSafeEqual(a,b))return false;const data=JSON.parse(Buffer.from(payload,'base64url').toString());return Number.isFinite(data.expires)&&data.expires>now&&data.expires<=now+SESSION_SECONDS*1000&&data.version===passwordVersion()}catch{return false}}
export function trustedOrigin(request){const allowed=process.env.NEXT_PUBLIC_SITE_URL;if(!allowed&&process.env.NODE_ENV==='production')return false;try{return request.headers.get('origin')===new URL(allowed||request.url).origin}catch{return false}}

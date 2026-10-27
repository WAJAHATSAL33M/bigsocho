import {createHmac,createHash,timingSafeEqual,scrypt as derive,randomBytes} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(derive);
export const COOKIE=process.env.NODE_ENV==='production'?'__Host-canvas-admin':'canvas-admin';
export const SESSION_SECONDS=60*60*8;
export const IDLE_SECONDS=30*60;
const legacy=/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/;
const modern=/^scrypt-v2\$[a-f0-9]{32}\$[a-f0-9]{128}$/;
export function validHashFormat(value){return legacy.test(value||'')||modern.test(value||'')}
export function siteOrigin(){try{const u=new URL(process.env.NEXT_PUBLIC_SITE_URL);if(u.username||u.password||u.pathname!=='/'||u.search||u.hash)return null;if(process.env.NODE_ENV==='production'&&u.protocol!=='https:')return null;if(!['http:','https:'].includes(u.protocol))return null;return u.origin}catch{return null}}
export function configured(){return Boolean(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.ADMIN_EMAIL?.trim()||'')&&validHashFormat(process.env.ADMIN_PASSWORD_HASH)&&process.env.SESSION_SECRET?.length>=32&&siteOrigin())}
const parameters={N:32768,r:8,p:3,maxmem:64*1024*1024};
export async function hashPassword(password){if(typeof password!=='string'||password.length<12||password.length>256)throw Error('Choose a password of 12–256 characters.');const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64,parameters);return `scrypt-v2$${salt}$${key.toString('hex')}`}
export async function validPassword(value){if(!configured()||typeof value!=='string'||value.length>256)return false;const [version,salt,expected]=process.env.ADMIN_PASSWORD_HASH.split('$');const key=await scrypt(value,salt,64,version==='scrypt-v2'?parameters:{N:16384,r:8,p:1,maxmem:32*1024*1024});return timingSafeEqual(key,Buffer.from(expected,'hex'))}
export function validEmail(value){return typeof value==='string'&&value.length<=254&&value.trim().toLowerCase()===process.env.ADMIN_EMAIL?.trim().toLowerCase()}
function sign(value){return createHmac('sha256',process.env.SESSION_SECRET).update(value).digest('base64url')}
function passwordVersion(){return createHash('sha256').update(`${process.env.ADMIN_EMAIL}:${process.env.ADMIN_PASSWORD_HASH}`).digest('hex')}
export function createSession(now=Date.now()){if(!configured())throw Error('Admin login is not configured.');const payload=Buffer.from(JSON.stringify({id:randomBytes(32).toString('hex'),expires:now+SESSION_SECONDS*1000,version:passwordVersion()})).toString('base64url');return payload+'.'+sign(payload)}
export function validSession(token,now=Date.now()){if(!configured()||typeof token!=='string'||token.length>1024)return false;try{const [payload,signature,...rest]=token.split('.');if(rest.length||!payload||!signature)return false;const a=Buffer.from(signature),b=Buffer.from(sign(payload));if(a.length!==b.length||!timingSafeEqual(a,b))return false;const data=JSON.parse(Buffer.from(payload,'base64url').toString());return /^[a-f0-9]{64}$/.test(data.id)&&Number.isFinite(data.expires)&&data.expires>now&&data.expires<=now+SESSION_SECONDS*1000&&data.version===passwordVersion()}catch{return false}}
export function trustedOrigin(request){const origin=siteOrigin();return Boolean(origin&&request.headers.get('origin')===origin&&request.headers.get('sec-fetch-site')!=='cross-site')}
export function cookieOptions(){return {httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:SESSION_SECONDS}}

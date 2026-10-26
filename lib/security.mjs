import {createHmac,createHash,timingSafeEqual,scrypt as derive,randomBytes} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(derive);
export const COOKIE='canvas-admin';
export const SESSION_SECONDS=60*60*8;
const hashPattern=/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/;
export function configured(){return Boolean(process.env.ADMIN_EMAIL?.includes('@')&&hashPattern.test(process.env.ADMIN_PASSWORD_HASH||'')&&process.env.SESSION_SECRET?.length>=32)}
export async function hashPassword(password){if(typeof password!=='string'||password.length<12||password.length>256)throw Error('Choose a password of 12–256 characters.');const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64);return `scrypt$${salt}$${key.toString('hex')}`}
export async function validPassword(value){if(!configured()||typeof value!=='string'||value.length>256)return false;const [,salt,expected]=process.env.ADMIN_PASSWORD_HASH.split('$');const key=await scrypt(value,salt,64);return timingSafeEqual(key,Buffer.from(expected,'hex'))}
export function validEmail(value){return typeof value==='string'&&value.trim().toLowerCase()===process.env.ADMIN_EMAIL?.trim().toLowerCase()}
function sign(value){return createHmac('sha256',process.env.SESSION_SECRET).update(value).digest('base64url')}
function passwordVersion(){return createHash('sha256').update(`${process.env.ADMIN_EMAIL}:${process.env.ADMIN_PASSWORD_HASH}`).digest('hex')}
export function createSession(now=Date.now()){if(!configured())throw Error('Admin login is not configured.');const payload=Buffer.from(JSON.stringify({expires:now+SESSION_SECONDS*1000,version:passwordVersion()})).toString('base64url');return payload+'.'+sign(payload)}
export function validSession(token,now=Date.now()){if(!configured()||typeof token!=='string'||token.length>1024)return false;try{const [payload,signature,...rest]=token.split('.');if(rest.length||!payload||!signature)return false;const a=Buffer.from(signature),b=Buffer.from(sign(payload));if(a.length!==b.length||!timingSafeEqual(a,b))return false;const data=JSON.parse(Buffer.from(payload,'base64url').toString());return Number.isFinite(data.expires)&&data.expires>now&&data.expires<=now+SESSION_SECONDS*1000&&data.version===passwordVersion()}catch{return false}}
export function trustedOrigin(request){const allowed=process.env.NEXT_PUBLIC_SITE_URL;if(!allowed&&process.env.NODE_ENV==='production')return false;try{return request.headers.get('origin')===new URL(allowed||request.url).origin}catch{return false}}

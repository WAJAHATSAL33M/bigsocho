import {createHmac} from 'node:crypto';
import {transaction} from './database.mjs';
export async function consumeRateLimit(scope,limit,windowMs,now=Date.now()){
 if(!process.env.SESSION_SECRET||!Number.isInteger(limit)||limit<1)throw Error('Rate limiter is not configured.');
 const key=createHmac('sha256',process.env.SESSION_SECRET).update(`canvas:${scope}`).digest('hex');
 return transaction(async connection=>{
 await connection.execute('INSERT IGNORE INTO canvas_rate_limits (identifier,attempts,expires_at) VALUES (?,0,?)',[key,now+windowMs]);
 const [rows]=await connection.execute('SELECT attempts,expires_at FROM canvas_rate_limits WHERE identifier=? FOR UPDATE',[key]);
 const expired=Number(rows[0].expires_at)<=now,count=expired?0:Number(rows[0].attempts),expires=expired?now+windowMs:Number(rows[0].expires_at);
 if(count>=limit)return {allowed:false,retryAfter:Math.max(1,Math.ceil((expires-now)/1000))};
 await connection.execute('UPDATE canvas_rate_limits SET attempts=?,expires_at=? WHERE identifier=?',[count+1,expires,key]);return {allowed:true,retryAfter:0};
 });
}
export function limited(retryAfter){return Response.json({error:'Too many requests. Please try again shortly.'},{status:429,headers:{'Retry-After':String(retryAfter),'Cache-Control':'no-store'}})}

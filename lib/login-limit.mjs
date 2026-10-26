import {createHmac} from 'node:crypto';
import {transaction} from './database.mjs';
// Account-wide counter: independent of proxy headers and shared by all app workers.
export async function reserveLoginAttempt(now=Date.now()){
 const key=createHmac('sha256',process.env.SESSION_SECRET).update(process.env.ADMIN_EMAIL.toLowerCase()).digest('hex');
 return transaction(async connection=>{
 await connection.execute('INSERT IGNORE INTO canvas_login_limits (identifier,attempts,expires_at) VALUES (?,0,?)',[key,now+900000]);
 const [rows]=await connection.execute('SELECT attempts,expires_at FROM canvas_login_limits WHERE identifier=? FOR UPDATE',[key]);
 const expired=Number(rows[0].expires_at)<=now,count=expired?0:rows[0].attempts;
 if(count>=5)return false;
 await connection.execute('UPDATE canvas_login_limits SET attempts=?,expires_at=? WHERE identifier=?',[count+1,expired?now+900000:rows[0].expires_at,key]);return true;
 });
}

import {createHash} from 'node:crypto';
import {database,transaction} from './database.mjs';
import {SESSION_SECONDS,IDLE_SECONDS,validSession} from './security.mjs';
const digest=token=>createHash('sha256').update(token).digest('hex');
export async function issueSession(token,now=Date.now()){if(!validSession(token,now))throw Error('Invalid session.');await transaction(async connection=>{await connection.execute('DELETE FROM canvas_sessions WHERE expires_at<=? OR last_seen<=?',[now,now-IDLE_SECONDS*1000]);await connection.execute('INSERT INTO canvas_sessions (id,expires_at,last_seen) VALUES (?,?,?)',[digest(token),now+SESSION_SECONDS*1000,now])})}
export async function sessionActive(token,now=Date.now()){if(!validSession(token,now))return false;const [rows]=await database().execute('SELECT id FROM canvas_sessions WHERE id=? AND expires_at>? AND last_seen>?',[digest(token),now,now-IDLE_SECONDS*1000]);if(!rows.length)return false;const [result]=await database().execute('UPDATE canvas_sessions SET last_seen=? WHERE id=? AND expires_at>? AND last_seen>?',[now,digest(token),now,now-IDLE_SECONDS*1000]);return result.affectedRows===1}
export async function revokeSession(token){if(typeof token==='string'&&token.length<=1024)await database().execute('DELETE FROM canvas_sessions WHERE id=?',[digest(token)])}

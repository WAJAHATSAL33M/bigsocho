import readline from 'node:readline';
import {Writable} from 'node:stream';
import {hashPassword} from '../lib/security.mjs';
let muted=false;const output=new Writable({write(chunk,encoding,callback){if(!muted)process.stdout.write(chunk,encoding);callback()}});
const terminal=readline.createInterface({input:process.stdin,output,terminal:process.stdin.isTTY});
terminal.question('Choose an admin password (12+ characters, hidden): ',async password=>{muted=false;process.stdout.write('\n');try{console.log('Set ADMIN_PASSWORD_HASH to the full value below:');console.log(await hashPassword(password))}catch(error){console.error(error.message);process.exitCode=1}finally{terminal.close()}});muted=true;

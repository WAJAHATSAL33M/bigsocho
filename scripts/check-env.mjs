import {isIP} from 'node:net';
import nextEnv from '@next/env';
const {loadEnvConfig}=nextEnv;
import {validHashFormat} from '../lib/security.mjs';
loadEnvConfig(process.cwd());
const checks=[],warnings=[];const check=(name,ok)=>checks.push({name,status:ok?'pass':'fail'});
const env=process.env;
check('production-mode',env.NODE_ENV==='production');
let site;try{site=new URL(env.NEXT_PUBLIC_SITE_URL)}catch{}
check('canonical-https-origin',Boolean(site&&site.protocol==='https:'&&!site.username&&!site.password&&site.pathname==='/'&&!site.search&&!site.hash));
check('private-owner-email',/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.ADMIN_EMAIL?.trim()||''));
check('password-hash-format',validHashFormat(env.ADMIN_PASSWORD_HASH));
check('session-secret-length',(env.SESSION_SECRET?.length||0)>=32);
check('database-variables-present',['DB_HOST','DB_NAME','DB_USER','DB_PASSWORD'].every(k=>Boolean(env[k])));
check('database-port',Number.isInteger(Number(env.DB_PORT||3306))&&Number(env.DB_PORT||3306)>0&&Number(env.DB_PORT||3306)<65536);
const local=['127.0.0.1','localhost','::1'].includes(env.DB_HOST);check('remote-database-tls',local||env.DB_SSL==='true');check('remote-database-hostname',local||Boolean(env.DB_HOST&&!isIP(env.DB_HOST)));
check('no-public-secret-variable',!Object.keys(env).some(k=>k.startsWith('NEXT_PUBLIC_')&&/(PASSWORD|SECRET|TOKEN|PRIVATE|DATABASE|DB_)/i.test(k)));
check('no-node-debugging',!/(--inspect|--debug|--trace)/.test(env.NODE_OPTIONS||'')&&!env.NODE_DEBUG);
if(env.ADMIN_PASSWORD_HASH?.startsWith('scrypt$'))warnings.push('Legacy password hash: regenerate with npm run admin:hash to use stronger parameters.');
if(env.ADMIN_PASSWORD)warnings.push('Remove the unused plaintext ADMIN_PASSWORD variable.');
if(env.GITHUB_TOKEN)warnings.push('Remove the unused GitHub publishing token and revoke it if no longer needed.');
if(process.argv.includes('--database')&&checks.every(c=>c.status==='pass')){
 const {database}=await import('../lib/database.mjs');try{await database().execute('SELECT name FROM canvas_documents LIMIT 1');await database().execute('SELECT id FROM canvas_sessions LIMIT 1');await database().execute('SELECT identifier FROM canvas_rate_limits LIMIT 1');check('database-schema',true);const [grants]=await database().query('SHOW GRANTS FOR CURRENT_USER');const text=JSON.stringify(grants);if(/ALL PRIVILEGES|\b(?:FILE|SUPER|GRANT OPTION|DROP|CREATE USER)\b/i.test(text))warnings.push('Database account has broad privileges. Use a runtime account limited to SELECT, INSERT, UPDATE and DELETE on this app database.');}catch{check('database-schema',false)}finally{await database().end()}
}
console.log(JSON.stringify({checks,warnings,note:'Values are never printed. Passing presence checks does not prove that credentials are correct or unexposed.'},null,2));
if(checks.some(c=>c.status==='fail'))process.exitCode=1;

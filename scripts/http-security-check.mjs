// Starts an isolated loopback-only server with no database credentials.
// Never logs in to, writes to, or scans an external deployment.
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {hashPassword} from '../lib/security.mjs';
const socket=createServer();await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve));const port=socket.address().port;await new Promise(resolve=>socket.close(resolve));
const env={...process.env,NODE_ENV:'production',NEXT_PUBLIC_SITE_URL:'https://audit.invalid',ADMIN_EMAIL:'owner@audit.invalid',ADMIN_PASSWORD_HASH:await hashPassword('isolated-http-security-test-password'),SESSION_SECRET:randomBytes(32).toString('hex'),DB_HOST:'',DB_USER:'',DB_NAME:'',DB_PASSWORD:'',ADMIN_PASSWORD:'',GITHUB_TOKEN:''};
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env,stdio:['ignore','pipe','pipe']});
try{
 await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Local server did not start.')),30000);server.stdout.on('data',chunk=>{if(chunk.toString().includes('Ready')){clearTimeout(timeout);resolve()}});server.once('error',reject);server.once('exit',code=>{clearTimeout(timeout);reject(Error('Local server exited: '+code))})});
 const base=`http://127.0.0.1:${port}`;
 for(const route of ['posts','media','health','comments']){const response=await fetch(`${base}/api/admin/${route}`);assert.equal(response.status,401,route);assert(!response.headers.has('access-control-allow-origin'))}
 for(const route of ['posts','media','categories','comments','login','logout']){const response=await fetch(`${base}/api/admin/${route}`,{method:'POST',headers:{Origin:'https://attacker.invalid','Content-Type':'application/json'},body:'{}'});assert.equal(response.status,403,route)}
 const spoof=await fetch(`${base}/api/admin/posts`,{headers:{'x-middleware-subrequest':'middleware:middleware:middleware:middleware:middleware'}});assert([400,401,403].includes(spoof.status));
 for(const path of ['/.env','/.git/config','/database/bootstrap.sql','/package.json','/scripts/hash-password.mjs','/backup.sql','/_next/image']){const response=await fetch(base+path);assert.equal(response.status,404,path)}
 const preflight=await fetch(`${base}/api/admin/posts`,{method:'OPTIONS',headers:{Origin:'https://attacker.invalid','Access-Control-Request-Method':'POST'}});assert(!preflight.headers.has('access-control-allow-origin'));
 const publicComment=await fetch(`${base}/api/comments`,{method:'POST'});assert.equal(publicComment.status,410);
 let previousNonce;const [post]=JSON.parse(await readFile(new URL('../content/posts.json',import.meta.url),'utf8'));
 for(const path of ['/','/','/about','/admin',`/articles/${post.slug}`]){const response=await fetch(base+path);assert.equal(response.status,200,path);assert(!response.headers.has('x-powered-by'));assert.equal(response.headers.get('x-frame-options'),'DENY');assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert(response.headers.get('strict-transport-security')?.includes('max-age='));assert(response.headers.get('permissions-policy'));assert(response.headers.get('cache-control')?.includes('no-store'));
 const csp=response.headers.get('content-security-policy');assert(csp);assert(!csp.includes('unsafe-inline'));assert(!csp.includes('unsafe-eval'));const nonce=csp.match(/'nonce-([^']+)'/)[1];assert.notEqual(nonce,previousNonce);previousNonce=nonce;const html=await response.text();assert(!/\sstyle=/.test(html),'Unexpected inline style blocked by CSP: '+path);const scripts=[...html.matchAll(/<script\b([^>]*)>/g)];assert(scripts.length>0);for(const script of scripts)assert(script[1].includes(`nonce="${nonce}"`),'Missing/mismatched script nonce: '+path);if(path.startsWith('/articles/')){const json=html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);assert(json);JSON.parse(json[1])}}
 console.log('HTTP security checks passed: owner-only endpoints, cross-origin rejection, no permissive CORS, private caching, sensitive paths, nonce CSP on all tested HTML scripts, headers and JSON-LD.');
}catch(error){console.error(error.message);process.exitCode=1}finally{server.kill('SIGTERM')}

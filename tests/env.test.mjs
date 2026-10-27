import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {hashPassword} from '../lib/security.mjs';
const hash=await hashPassword('local-env-check-test-password');
const env={...process.env,NODE_ENV:'production',NEXT_PUBLIC_SITE_URL:'https://journal.example',ADMIN_EMAIL:'owner@example.com',ADMIN_PASSWORD_HASH:hash,SESSION_SECRET:'environment-check-test-secret-123456789012345',DB_HOST:'127.0.0.1',DB_USER:'private-test-user',DB_NAME:'private-test-database',DB_PASSWORD:'private-test-db-password',DB_PORT:'3306',DB_SSL:'false'};
test('production env check reports pass/fail without exposing credentials',()=>{const result=spawnSync(process.execPath,['scripts/check-env.mjs'],{env,encoding:'utf8'});assert.equal(result.status,0,result.stdout);for(const value of [env.ADMIN_EMAIL,hash,env.SESSION_SECRET,env.DB_USER,env.DB_NAME,env.DB_PASSWORD])assert(!result.stdout.includes(value));const invalid=spawnSync(process.execPath,['scripts/check-env.mjs'],{env:{...env,NEXT_PUBLIC_PRIVATE_TOKEN:'private-test-token'},encoding:'utf8'});assert.equal(invalid.status,1);assert(!invalid.stdout.includes('private-test-token'));assert(JSON.parse(invalid.stdout).checks.some(c=>c.name==='no-public-secret-variable'&&c.status==='fail'))});

import {spawn} from 'node:child_process';
process.env.NODE_ENV='production';
await import('./check-env.mjs');
if(process.exitCode)process.exit(process.exitCode);
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start'],{env:process.env,stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.kill(signal));
server.on('error',()=>{console.error('Production server could not start.');process.exitCode=1});
server.on('exit',(code,signal)=>{process.exitCode=code??(signal?1:0)});

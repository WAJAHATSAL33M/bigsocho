import {NextResponse} from 'next/server';
import {randomBytes} from 'node:crypto';
import {contentPolicy,sensitivePath} from './lib/headers.mjs';
export function proxy(request){
 if(sensitivePath(request.nextUrl.pathname))return new NextResponse('Not found',{status:404,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 const nonce=randomBytes(24).toString('base64'),policy=contentPolicy(nonce,process.env.NODE_ENV==='development');
 const headers=new Headers(request.headers);headers.set('x-nonce',nonce);headers.set('Content-Security-Policy',policy);
 const response=NextResponse.next({request:{headers}});response.headers.set('Content-Security-Policy',policy);
 // Nonce-bearing HTML and private APIs must not be cached by an upstream CDN.
 response.headers.set('Cache-Control','private, no-store');return response;
}
export const config={matcher:['/((?!_next/static|favicon.ico|assets/).*)']};

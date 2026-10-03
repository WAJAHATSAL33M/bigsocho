import {cookies} from 'next/headers';
import {COOKIE,trustedOrigin} from '../../../../lib/security.mjs';
export async function POST(request){if(!trustedOrigin(request))return Response.json({error:'Request origin is not allowed.'},{status:403});(await cookies()).set(COOKIE,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:0});return Response.json({ok:true})}

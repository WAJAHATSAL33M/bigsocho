// Reader comment controls were removed from the site. Do not keep an unused
// anonymous write API exposed; historical moderation stays owner-only.
export function GET(){return Response.json({comments:[],enabled:false},{headers:{'Cache-Control':'no-store'}})}
export function POST(){return Response.json({error:'Public comments are disabled.'},{status:410,headers:{'Cache-Control':'no-store'}})}

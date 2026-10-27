import {requireAdminRead} from '../../../../lib/auth';
import {clientError} from '../../../../lib/request.mjs';
import {dateRange} from '../../../../lib/analytics.mjs';
import {analyticsSummary} from '../../../../lib/analytics-db.mjs';
import {readRepository} from '../../../../lib/content';
export async function GET(request){const denied=await requireAdminRead();if(denied)return denied;try{const days=dateRange(new URL(request.url).searchParams.get('days')??30);const data=await analyticsSummary(days);const {posts}=await readRepository();data.articles=data.articles.map(row=>({...row,title:posts.find(p=>p.slug===row.slug)?.title||row.slug}));return Response.json(data,{headers:{'Cache-Control':'private,no-store'}})}catch(error){if(error.code==='ER_NO_SUCH_TABLE')return Response.json({error:'Analytics setup is needed. Import database/analytics-migration.sql in phpMyAdmin.'},{status:503});return clientError(error,'Analytics is temporarily unavailable.')}}

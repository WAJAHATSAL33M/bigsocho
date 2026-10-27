import {database,transaction} from './database.mjs';
import {fillDaily} from './analytics.mjs';
export async function pruneAnalytics(){const [result]=await database().execute('DELETE FROM canvas_pageviews WHERE created_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 90 DAY)');await database().execute('DELETE FROM canvas_analytics_limits WHERE expires_at<=?',[Date.now()]);return result.affectedRows}
export async function recordPageview(event,visitor,visit){await pruneAnalytics();const [result]=await database().execute('INSERT IGNORE INTO canvas_pageviews (event_id,visitor_hash,visit_hash,path,post_slug,device,source,created_at) VALUES (?,?,?,?,?,?,?,UTC_TIMESTAMP())',[event.eventId,visitor,visit,event.path,event.postSlug,event.device,event.source]);return result.affectedRows===1}
export async function analyticsSummary(days){await pruneAnalytics();const since=days-1;const connection=await database().getConnection();try{await connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');await connection.beginTransaction();
 const [totals,daily,pages,articles,sources,devices]=await Promise.all([
 connection.execute('SELECT COUNT(*) AS views,COUNT(DISTINCT visitor_hash) AS visitors,COUNT(DISTINCT visit_hash) AS visits,COALESCE(SUM(post_slug IS NOT NULL),0) AS blogViews FROM canvas_pageviews WHERE created_at >= DATE_SUB(UTC_DATE(),INTERVAL ? DAY)',[since]),
 connection.execute("SELECT DATE_FORMAT(created_at,'%Y-%m-%d') AS day,COUNT(*) AS views,COUNT(DISTINCT visitor_hash) AS visitors,COUNT(DISTINCT visit_hash) AS visits FROM canvas_pageviews WHERE created_at >= DATE_SUB(UTC_DATE(),INTERVAL ? DAY) GROUP BY day ORDER BY day",[since]),
 connection.execute('SELECT path,COUNT(*) AS views,COUNT(DISTINCT visitor_hash) AS visitors FROM canvas_pageviews WHERE created_at >= DATE_SUB(UTC_DATE(),INTERVAL ? DAY) GROUP BY path ORDER BY views DESC,path LIMIT 10',[since]),
 connection.execute('SELECT post_slug AS slug,COUNT(*) AS views,COUNT(DISTINCT visitor_hash) AS visitors FROM canvas_pageviews WHERE post_slug IS NOT NULL AND created_at >= DATE_SUB(UTC_DATE(),INTERVAL ? DAY) GROUP BY post_slug ORDER BY views DESC,post_slug LIMIT 10',[since]),
 connection.execute('SELECT source,COUNT(*) AS views FROM canvas_pageviews WHERE created_at >= DATE_SUB(UTC_DATE(),INTERVAL ? DAY) GROUP BY source ORDER BY views DESC,source LIMIT 10',[since]),
 connection.execute('SELECT device,COUNT(*) AS views FROM canvas_pageviews WHERE created_at >= DATE_SUB(UTC_DATE(),INTERVAL ? DAY) GROUP BY device ORDER BY views DESC,device',[since])
 ]);
 await connection.commit();return {days,timeZone:'UTC',generatedAt:new Date().toISOString(),totals:Object.fromEntries(Object.entries(totals[0][0]).map(([key,value])=>[key,Number(value)])),daily:fillDaily(daily[0],days),pages:pages[0],articles:articles[0],sources:sources[0],devices:devices[0]};
 }catch(error){try{await connection.rollback()}catch{}throw error}finally{connection.release()}
}

export async function limitAnalyticsBrowser(identifier,now=Date.now()){await database().execute('DELETE FROM canvas_analytics_limits WHERE expires_at<=? LIMIT 500',[now]);return transaction(async connection=>{
 await connection.execute('INSERT IGNORE INTO canvas_analytics_limits (identifier,attempts,expires_at) VALUES (?,0,?)',[identifier,now+60000]);
 const [rows]=await connection.execute('SELECT attempts,expires_at FROM canvas_analytics_limits WHERE identifier=? FOR UPDATE',[identifier]);
 const expired=Number(rows[0].expires_at)<=now,count=expired?0:Number(rows[0].attempts),expires=expired?now+60000:Number(rows[0].expires_at);
 if(count>=30)return {allowed:false,retryAfter:Math.max(1,Math.ceil((expires-now)/1000))};
 await connection.execute('UPDATE canvas_analytics_limits SET attempts=?,expires_at=? WHERE identifier=?',[count+1,expires,identifier]);return {allowed:true,retryAfter:0};
})}

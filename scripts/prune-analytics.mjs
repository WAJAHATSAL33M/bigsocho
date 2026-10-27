import nextEnv from '@next/env';
import {database,databaseConfigured} from '../lib/database.mjs';
import {pruneAnalytics} from '../lib/analytics-db.mjs';
nextEnv.loadEnvConfig(process.cwd());
try{console.log('Removed expired pageviews:',await pruneAnalytics())}catch(error){console.error('Analytics cleanup failed:',error.code||error.name);process.exitCode=1}finally{if(databaseConfigured())await database().end()}

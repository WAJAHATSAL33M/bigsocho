import nextEnv from '@next/env';
const {loadEnvConfig}=nextEnv;
import {readFile} from 'node:fs/promises';
import {database,transaction,databaseConfigured} from '../lib/database.mjs';
import {categories} from '../lib/post-validation.mjs';
loadEnvConfig(process.cwd());
try{
 const sql=await readFile(new URL('../database/schema.sql',import.meta.url),'utf8');
 for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await database().query(statement);
 const posts=JSON.parse(await readFile(new URL('../content/posts.json',import.meta.url),'utf8'));
 const comments=JSON.parse(await readFile(new URL('../content/comments.json',import.meta.url),'utf8'));
 const allCategories=[...new Set([...categories,...posts.map(p=>p.category)])];
 await transaction(async connection=>{for(const [name,value] of [['posts',posts],['categories',allCategories],['comments',comments]])await connection.execute('INSERT IGNORE INTO canvas_documents (name,payload) VALUES (?,?)',[name,JSON.stringify(value)])});
 console.log('Database ready. Existing database content was preserved.');
}catch(error){console.error('Setup failed:',error.code||error.message);process.exitCode=1}finally{if(databaseConfigured())await database().end()}

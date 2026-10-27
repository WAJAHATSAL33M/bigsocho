import {isIP} from 'node:net';
import mysql from 'mysql2/promise';
let pool;
export function databaseConfigured(){return Boolean(process.env.DB_HOST&&process.env.DB_USER&&process.env.DB_NAME&&process.env.DB_PASSWORD)}
export function database(){
 if(!databaseConfigured())throw Error('Database is not configured. Add the DB_* variables in Hostinger.');
 const port=Number(process.env.DB_PORT||3306);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid database port.');
 const local=['127.0.0.1','localhost','::1'].includes(process.env.DB_HOST);if(process.env.NODE_ENV==='production'&&!local&&process.env.DB_SSL!=='true')throw Error('Remote databases require verified TLS.');
 if(process.env.NODE_ENV==='production'&&!local&&isIP(process.env.DB_HOST))throw Error('Use the certified hostname for a remote database.');
 if(!pool)pool=mysql.createPool({host:process.env.DB_HOST,port,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,charset:'utf8mb4',flags:['FOUND_ROWS'],multipleStatements:false,enableKeepAlive:true,connectionLimit:5,connectTimeout:10000,waitForConnections:true,queueLimit:30,ssl:process.env.DB_SSL==='true'?{rejectUnauthorized:true,verifyIdentity:true,...(process.env.DB_SSL_CA?{ca:process.env.DB_SSL_CA.split(String.fromCharCode(92)+'n').join(String.fromCharCode(10))}:{})}:undefined});
 return pool;
}
export async function transaction(work){const connection=await database().getConnection();try{await connection.beginTransaction();const result=await work(connection);await connection.commit();return result}catch(error){try{await connection.rollback()}catch{}throw error}finally{connection.release()}}
export async function readDocument(name,connection=database(),lock=false){const [rows]=await connection.execute(`SELECT payload,revision FROM canvas_documents WHERE name=?${lock?' FOR UPDATE':''}`,[name]);if(!rows.length)throw Error('Database tables are not ready. Run npm run db:setup.');return {value:JSON.parse(rows[0].payload),revision:String(rows[0].revision)}}
export async function writeDocument(connection,name,value){await connection.execute('UPDATE canvas_documents SET payload=?,revision=revision+1 WHERE name=?',[JSON.stringify(value),name]);}
export async function audit(connection,action,target){await connection.execute('INSERT INTO canvas_audit (action,target) VALUES (?,?)',[action,String(target).slice(0,160)]);}
export function databaseFailure(error){console.error('Database request failed:',error.code||error.name);return 'Database unavailable. Check Hostinger database settings and run the database setup.'}

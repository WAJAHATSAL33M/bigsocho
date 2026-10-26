import {readDocument,writeDocument,transaction} from './database.mjs';
export async function readComments(){const data=await readDocument('comments');return {comments:data.value,sha:data.revision}}
export async function changeComments(transform){return transaction(async connection=>{const {value}=await readDocument('comments',connection,true);const next=transform(value);if(next.length>10000)throw Error('Comment limit reached.');await writeDocument(connection,'comments',next);return next})}

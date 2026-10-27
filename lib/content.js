import {RequestError} from './errors.mjs';
import initialPosts from '../content/posts.json';
import {categories as defaultCategories,publicPosts,validatePost} from './post-validation.mjs';
import {databaseConfigured,readDocument,writeDocument,transaction,audit} from './database.mjs';
export const storageConfigured=databaseConfigured;
export async function readRepository(){const [posts,categories]=await Promise.all([readDocument('posts'),readDocument('categories')]);return {posts:posts.value,sha:posts.revision,categories:categories.value}}
export async function getPublishedPosts(){if(!databaseConfigured())return publicPosts(initialPosts);return publicPosts((await readDocument('posts')).value)}
export async function getCategories(){if(!databaseConfigured())return defaultCategories;return (await readDocument('categories')).value}
function conflict(message){const e=Error(message);e.status=409;return e}
export async function savePost(input){return transaction(async connection=>{
 // Always lock categories before posts, including category deletion.
 const categories=await readDocument('categories',connection,true),collection=await readDocument('posts',connection,true);
 if(String(input.revision)!==collection.revision)throw conflict('Posts changed while you were editing. Refresh the list before saving.');
 const posts=collection.value,existing=posts.find(p=>p.slug===input.post?.slug);
 if(input.mode==='create'&&existing)throw conflict('That URL slug is already in use.');
 if(input.mode!=='create'&&input.mode!=='update'&&input.mode!=='delete')throw new RequestError('Invalid save action.');
 if(input.mode!=='create'&&!existing)throw conflict('Post no longer exists. Refresh the list.');
 const post=input.mode==='delete'?existing:validatePost(input.post,input.mode==='update'?existing:null,new Date(),categories.value);
 const next=input.mode==='delete'?posts.filter(p=>p.slug!==post.slug):input.mode==='update'?posts.map(p=>p.slug===post.slug?post:p):[post,...posts];
 await writeDocument(connection,'posts',next);await audit(connection,input.mode==='delete'?'delete-post':post.status==='published'?'publish-post':'save-draft',post.slug);
 return {post:input.mode==='delete'?null:post,posts:next,categories:categories.value,revision:String(BigInt(collection.revision)+1n)};
 });}
export async function changeCategory({action,name}){
 if(typeof name!=='string'||!name.trim()||name.trim().length>60)throw new RequestError('Category names must be 1–60 characters.');name=name.trim();
 return transaction(async connection=>{const collection=await readDocument('categories',connection,true);let next=collection.value;
 if(action==='add'){if(next.some(c=>c.toLowerCase()===name.toLowerCase()))throw conflict('Category already exists.');if(next.length>=40)throw new RequestError('Use at most 40 categories.');next=[...next,name]}
 else if(action==='delete'){const posts=await readDocument('posts',connection,true);if(posts.value.some(p=>p.category===name))throw conflict('Move posts out of this category before deleting it.');if(next.length<=1)throw new RequestError('Keep at least one category.');next=next.filter(c=>c!==name)}
 else throw new RequestError('Choose add or delete.');
 await writeDocument(connection,'categories',next);await audit(connection,`${action}-category`,name);return next;
 });
}

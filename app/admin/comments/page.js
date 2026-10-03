import {redirect} from 'next/navigation';
import {authenticated} from '../../../lib/auth';
import CommentModeration from '../../../components/CommentModeration';
export const metadata={title:'Review comments',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function Page(){if(!await authenticated())redirect('/admin');return <CommentModeration/>}

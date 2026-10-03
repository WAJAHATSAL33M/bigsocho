import Journal from '../components/Journal';
import {getPublishedPosts} from '../lib/github-content';
export const dynamic='force-dynamic';
export const metadata={alternates:{canonical:'/'}};
export default async function Home(){return <Journal posts={await getPublishedPosts()}/>}

import Journal from '../components/Journal';
import {getPublishedPosts,getCategories} from '../lib/content';
export const dynamic='force-dynamic';
export const metadata={alternates:{canonical:'/'}};
export default async function Home(){const [posts,categories]=await Promise.all([getPublishedPosts(),getCategories()]);return <Journal posts={posts} categoryNames={categories}/>}

import Journal from '../components/Journal';
import posts from '../content/posts.json';
export const metadata={alternates:{canonical:'/'}};
export default function Home(){return <Journal posts={posts}/>}

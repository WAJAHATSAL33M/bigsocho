import Link from 'next/link';
import Header from '../components/Header';
export default function NotFound(){return <><Header/><main className="reader"><h1>Story not found</h1><p>This page is unavailable.</p><Link href="/">Explore the journal</Link></main></>}

import Link from 'next/link';
import './globals.css';
const origin=process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const metadata={metadataBase:new URL(origin),title:{default:'CREATACANVAS — Inspiration Journal',template:'%s | CREATACANVAS'},description:'Practical ideas for home, travel, style, food and creative living.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}){return <html lang="en"><body>{children}<footer><span>© 2026 CREATACANVAS</span><div className="footer-links"><Link href="/about">About</Link><Link href="/editorial-policy">Editorial policy</Link><Link href="/privacy">Privacy & cookies</Link><Link href="/contact">Contact</Link></div></footer></body></html>}

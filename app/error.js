'use client';
export default function ErrorPage({reset}){return <main className="reader"><h1>We’ll be right back.</h1><p>The journal is temporarily unavailable. Please try again in a moment.</p><button className="storage-button" onClick={reset}>Try again</button></main>}

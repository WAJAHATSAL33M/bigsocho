import content from '../../content/about.json';
import Header from '../../components/Header';
export const metadata={title:content.title,alternates:{canonical:'/about'}};
export default function Page(){return <><Header/><main className="reader"><div dangerouslySetInnerHTML={{__html:content.html}}/></main></>}

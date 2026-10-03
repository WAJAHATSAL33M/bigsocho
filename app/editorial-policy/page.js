import content from '../../content/editorial-policy.json';
import Header from '../../components/Header';
export const metadata={title:content.title,alternates:{canonical:'/editorial-policy'}};
export default function Page(){return <><Header/><main className="reader"><div dangerouslySetInnerHTML={{__html:content.html}}/></main></>}

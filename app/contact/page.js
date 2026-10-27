import {safePublisherHtml} from '../../lib/sanitize.mjs';
import content from '../../content/contact.json';
import Header from '../../components/Header';
export const metadata={title:content.title,alternates:{canonical:'/contact'}};
export default function Page(){return <><Header/><main className="reader"><div dangerouslySetInnerHTML={{__html:safePublisherHtml(content.html)}}/></main></>}

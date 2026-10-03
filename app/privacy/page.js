import content from '../../content/privacy.json';
import Header from '../../components/Header';
import ClearPreferences from '../../components/ClearPreferences';
export const metadata={title:content.title,alternates:{canonical:'/privacy'}};
export default function Page(){return <><Header/><main className="reader"><div dangerouslySetInnerHTML={{__html:content.html}}/><ClearPreferences/></main></>}

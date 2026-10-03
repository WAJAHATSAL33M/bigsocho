import {authenticated} from '../../lib/auth';
import {configured} from '../../lib/security.mjs';
import {storageConfigured} from '../../lib/github-content';
import AdminPanel from '../../components/AdminPanel';
export const metadata={title:'Admin',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function Admin(){return <AdminPanel signedIn={await authenticated()} loginConfigured={configured()} publishingConfigured={storageConfigured()}/>}

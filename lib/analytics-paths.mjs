export const PUBLIC_PATHS=['/','/about','/editorial-policy','/privacy','/contact'];
export function isPublicAnalyticsPath(path){return typeof path==='string'&&path.length<=180&&(PUBLIC_PATHS.includes(path)||/^\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path))}

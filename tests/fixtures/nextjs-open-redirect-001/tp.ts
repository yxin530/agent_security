import { redirect } from 'next/navigation'; export default function Page({ searchParams }) { redirect(searchParams.get('url')); }

import { redirect } from 'next/navigation'; export async function GET(req) { const url = req.nextUrl.searchParams.get('url'); if (url.startsWith('/')) redirect(url); }

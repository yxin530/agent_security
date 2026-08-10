export async function POST(request: Request) { const session = await getServerSession(authOptions); return Response.json({ success: true }); }

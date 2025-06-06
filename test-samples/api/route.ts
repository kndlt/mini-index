// API route example
export async function POST(request) {
  const data = await request.json();
  return Response.json({ message: 'Success' });
}

export function GET() {
  return Response.json({ status: 'ok' });
}

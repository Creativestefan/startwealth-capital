import authHandler from "@/lib/auth"

// Add CORS headers to prevent CORS issues
export async function OPTIONS(request: Request) {
  const response = new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
  return response;
}

export { authHandler as GET, authHandler as POST }


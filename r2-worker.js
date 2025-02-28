export default {
    async fetch(request, env) {
      // Handle CORS
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, DELETE",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        })
      }
  
      // Verify API token
      const authHeader = request.headers.get("Authorization")
      if (!authHeader || authHeader !== `Bearer ${env.API_TOKEN}`) {
        return new Response("Unauthorized", { status: 401 })
      }
  
      const url = new URL(request.url)
  
      if (request.method === "GET" && url.pathname === "/uploadUrl") {
        const fileName = url.searchParams.get("file")
        if (!fileName) {
          return new Response("File name is required", { status: 400 })
        }
  
        // Create a presigned URL for upload
        const uploadUrl = await env.MY_BUCKET.createPresignedUrl(fileName, {
          expiresIn: 3600, // URL expires in 1 hour
        })
  
        return new Response(
          JSON.stringify({
            result: {
              id: fileName,
              uploadURL: uploadUrl,
            },
            success: true,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        )
      }
  
      if (request.method === "DELETE" && url.pathname === "/deleteFile") {
        const fileName = url.searchParams.get("file")
        if (!fileName) {
          return new Response("File name is required", { status: 400 })
        }
  
        await env.MY_BUCKET.delete(fileName)
  
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        })
      }
  
      return new Response("Not found", { status: 404 })
    },
  }
  
  
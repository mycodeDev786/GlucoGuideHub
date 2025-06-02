// app/api/gi/route.js (or route.ts)
export async function POST(req, res) {
  console.log("Received a POST request to /api/gi!");
  return Response.json({
    success: true,
    message: "POST request received successfully!",
  });
}

export async function GET(req, res) {
  console.log("Received a GET request to /api/gi!");
  return Response.json({ success: false, error: "GET method not allowed." });
}

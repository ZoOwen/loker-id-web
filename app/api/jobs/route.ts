import { API_BASE_URL } from "@/lib/api";

// The backend at API_BASE_URL doesn't send CORS headers, so the browser
// can't call it directly from client components. This route proxies
// same-origin requests to it server-side (server-to-server has no CORS).
export async function GET(request: Request) {
  const { search } = new URL(request.url);
  const res = await fetch(`${API_BASE_URL}/api/jobs${search}`, {
    cache: "no-store",
  });
  const body = await res.text();

  return new Response(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

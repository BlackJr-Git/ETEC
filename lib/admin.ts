import { auth } from "@/lib/auth";

export async function requireSession(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

export function parsePagination(url: URL) {
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)),
  );
  return { page, limit, offset: (page - 1) * limit };
}

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

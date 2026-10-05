/**
 * Client for the serverless API in /api (Vercel functions).
 * VITE_API_BASE_URL can point at another origin; by default the API is
 * served from the same site.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiRequest = async <T = unknown>(
  path: string,
  { body, token, method = "POST" }: { body?: unknown; token?: string; method?: string } = {}
): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Network error. Please check your connection.", 0);
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new ApiError(
      data.error ||
        (response.status === 404
          ? "This feature isn't available on this deployment yet."
          : "Something went wrong. Please try again."),
      response.status
    );
  }
  return data;
};

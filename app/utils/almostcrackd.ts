const API_BASE = "https://api.almostcrackd.ai";

export type AlmostCrackdResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
};

export async function postAlmostCrackd<T>(
  path: string,
  body: unknown,
  token: string,
): Promise<AlmostCrackdResult<T>> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data: null,
      error: text || "Request failed.",
    };
  }

  if (!text) {
    return {
      ok: true,
      status: response.status,
      data: null,
      error: null,
    };
  }

  try {
    const data = JSON.parse(text) as T;
    return {
      ok: true,
      status: response.status,
      data,
      error: null,
    };
  } catch {
    return {
      ok: false,
      status: 502,
      data: null,
      error: "Invalid JSON received from API.",
    };
  }
}

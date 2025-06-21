import { hc } from "hono/client";
import type { Session } from "better-auth";
import type { shifts } from "../../../backend/src/routes/shifts";

const BASE_URL = "http://192.168.178.80:3001";

type ApiPath = "shifts" | "claims";

export function createApiClient(
  path: ApiPath,
  sessionData: Session | null = null
) {
  switch (path) {
    case "shifts":
      return hc<shifts>(`${BASE_URL}/${path}`, {
        fetch: ((input, init) => {
          return fetch(input, {
            ...init,
            headers: {
              ...init?.headers,
              Authorization: `Bearer ${sessionData?.token}`,
            },
          });
        }) satisfies typeof fetch,
      });
  }
}

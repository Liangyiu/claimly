import { hc } from "hono/client";
import type { Session } from "better-auth";
import type { shifts } from "../../../backend/src/routes/shifts";
import type { claims } from "../../../backend/src/routes/claims";

const BASE_URL = "https://api.cc-dev.llama.onl";

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
    case "claims":
      return hc<claims>(`${BASE_URL}/${path}`, {
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

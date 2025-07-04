import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { adminClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001", // Base URL of your Better Auth backend.
  plugins: [
    expoClient({
      scheme: "claimly",
      storagePrefix: "claimly",
      storage: SecureStore,
    }),
    adminClient(),
  ],
});

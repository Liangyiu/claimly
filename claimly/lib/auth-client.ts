import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001",
  plugins: [
    expoClient({
      scheme: "claimly",
      storagePrefix: "claimly",
      storage: SecureStore,
    }),
  ],
});

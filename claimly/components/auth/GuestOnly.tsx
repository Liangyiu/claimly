import { ViewProps } from "react-native";
import { useEffect } from "react";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "expo-router";

const GuestOnly = ({ children }: ViewProps) => {
  const { data: sessionData } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (sessionData?.user || sessionData?.session) {
      router.replace("/shifts");
    }
  }, [sessionData]);

  return children;
};

export default GuestOnly;

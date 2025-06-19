import { Stack, useRouter } from "expo-router";
import UserOnly from "~/components/auth/UserOnly";
import { CreateShiftButton } from "~/components/CreateShiftButton";
import { authClient } from "~/lib/auth-client";

const DashboardLayout = () => {
  return (
    <UserOnly>
      <Stack
        screenOptions={{
          headerRight: () => {
            const router = useRouter();
            const { data: sessionData } = authClient.useSession();

            if (sessionData?.user?.role === "admin") {
              return (
                <CreateShiftButton onPress={() => router.push("/shifts")} />
              );
            }

            return null;
          },
        }}
      />
    </UserOnly>
  );
};

export default DashboardLayout;

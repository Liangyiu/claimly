import { Tabs, useRouter } from "expo-router";
import UserOnly from "~/components/auth/UserOnly";
import { FontAwesome6 } from "@expo/vector-icons";
import { authClient } from "~/lib/auth-client";
import { CreateShiftButton } from "~/components/CreateShiftButton";

const DashboardLayout = () => {
  return (
    <UserOnly>
      <Tabs>
        <Tabs.Screen
          name="shifts"
          options={{
            title: "Shifts",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome6 name="calendar" color={color} size={size} />
            ),
            headerRight: () => {
              const router = useRouter();
              const { data: sessionData } = authClient.useSession();

              if (sessionData?.user?.role === "admin") {
                return (
                  <CreateShiftButton
                    onPress={() => router.push("/create-shift")}
                  />
                );
              }

              return null;
            },
          }}
        />
        <Tabs.Screen
          name="my-shifts"
          options={{
            title: "Claimed Shifts",
            tabBarIcon: ({ color, size }) => (
              <FontAwesome6 name="calendar-check" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="create-shift"
          options={{
            title: "Create a new shift",
            href: null,
          }}
        />
      </Tabs>
    </UserOnly>
  );
};

export default DashboardLayout;

import * as React from "react";
import { View } from "react-native";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { useRouter } from "expo-router";
import { authClient } from "~/lib/auth-client";

export default function Screen() {
  const router = useRouter();
  const { data: sessionData } = authClient.useSession();
  return (
    <View className="flex-1 gap-5 justify-center items-center p-6 bg-secondary/30">
      <Card className="p-6 w-full max-w-sm rounded-2xl">
        <CardHeader className="items-center">
          <CardTitle className="pb-2 text-center">Claimly</CardTitle>
          <CardDescription className="text-center">
            logged in as {sessionData?.user?.email || "guest"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View className="flex gap-3 justify-around">
            <Button onPress={() => router.push("/login")}>
              <Text>Login</Text>
            </Button>
            <Button onPress={() => router.push("/register")}>
              <Text>Register</Text>
            </Button>
            <Button onPress={() => router.push("/shifts")}>
              <Text>Shifts</Text>
            </Button>
            {sessionData?.user && (
              <Button
                variant="destructive"
                onPress={async () => {
                  await authClient.signOut();
                }}
              >
                <Text>Logout</Text>
              </Button>
            )}
          </View>
        </CardContent>
        <CardFooter className="flex-col gap-3 pb-0"></CardFooter>
      </Card>
    </View>
  );
}

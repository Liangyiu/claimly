import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { authClient } from "~/lib/auth-client";

type Props = {};

const Login = (props: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("All fields are required");
      return;
    }
    setError("");
    setIsLoading(true);
    await authClient.signIn.email(
      { email, password },
      {
        onError: (error) => {
          setIsLoading(false);
          setError(error.error.message);
        },
        onSuccess: () => {
          setIsLoading(false);
          router.replace("/shifts");
        },
      }
    );
  };

  return (
    <View className="flex-1 gap-5 justify-center items-center p-6 bg-secondary/30">
      <Card className="p-6 w-full max-w-sm rounded-2xl">
        <CardHeader className="items-center">
          <CardTitle className="pb-2 text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="p-3" />
          <View className="flex-col gap-3">
            <Input
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {error && (
            <View className="flex items-center w-full">
              <Text className="text-center text-red-500">{error}</Text>
            </View>
          )}

          <View className="p-4" />
          <Button className="w-full" onPress={handleLogin}>
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-center">Login</Text>
            )}
          </Button>
        </CardContent>
        <CardFooter>
          <View className="flex items-center w-full">
            <Link href="/register">
              <Text className="text-center underline color-foreground">
                Register instead?
              </Text>
            </Link>
          </View>
        </CardFooter>
      </Card>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({});

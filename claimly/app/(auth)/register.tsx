import { ActivityIndicator, Text, View } from "react-native";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Link, useRouter } from "expo-router";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

type Props = {};

const Register = (props: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !name) {
      setError("All fields are required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setError("");

    setIsLoading(true);

    await authClient.signUp.email(
      { email, password, name: email },
      {
        onError: (error) => {
          setIsLoading(false);
          setError(error.error.message);
        },
        onSuccess: () => {
          setIsLoading(false);
          router.replace("/");
        },
      }
    );
  };

  return (
    <View className="flex-1 gap-5 justify-center items-center p-6 bg-secondary/30">
      <Card className="p-6 w-full max-w-sm rounded-2xl">
        <CardHeader className="items-center">
          <CardTitle className="pb-2 text-center">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="p-3" />
          <View className="flex-col gap-3">
            <Input placeholder="Name" value={name} onChangeText={setName} />
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
          <Button className="w-full" onPress={handleRegister}>
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-center">Register</Text>
            )}
          </Button>
        </CardContent>
        <CardFooter>
          <View className="flex items-center w-full">
            <Link href="/login">
              <Text className="text-center underline color-foreground">
                Login instead?
              </Text>
            </Link>
          </View>
        </CardFooter>
      </Card>
    </View>
  );
};

export default Register;

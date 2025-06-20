import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
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
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(124, "Password must be less than 124 characters"),
});

type LoginSchema = z.infer<typeof loginSchema>;

type Props = {};

const Login = (props: Props) => {
  const { control, handleSubmit, trigger, formState } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async ({ email, password }: LoginSchema) => {
    setLoading(true);

    await authClient.signIn.email(
      { email, password },
      {
        onError: (error) => {
          setLoading(false);
          setError(error.error.message);
        },
        onSuccess: () => {
          setLoading(false);
          router.replace("/shifts");
        },
      }
    );
  };

  return (
    <View className="flex-1 p-6 bg-secondary/30">
      <KeyboardAvoidingView
        behavior={"padding"}
        className="flex-1 justify-center"
      >
        <View className="gap-4 self-center w-full max-w-sm">
          <Text className="pb-4 text-3xl font-bold text-center text-foreground">
            Login
          </Text>
          <Controller
            control={control}
            name="email"
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <>
                <Input
                  placeholder="Email"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                />
                {error && <Text className="text-red-500">{error.message}</Text>}
              </>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <>
                <Input
                  placeholder="Password"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                />
                {error && <Text className="text-red-500">{error.message}</Text>}
              </>
            )}
          />
          {error && <Text className="text-red-500">{error}</Text>}
          <Button
            className="mt-4 w-full"
            onPress={handleSubmit(handleLogin)}
            disabled={!formState.isValid || loading}
          >
            {loading ? (
              <ActivityIndicator className="text-foreground" />
            ) : (
              <Text className="text-center">Login</Text>
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
      <View className="items-center pb-4">
        <Button
          variant="link"
          onPress={() => router.push("/register")}
          className="p-0"
        >
          <Text className="text-center underline color-foreground">
            Register instead?
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({});

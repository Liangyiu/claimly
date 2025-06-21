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
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyboardAvoidingView } from "react-native";
import { Platform } from "react-native";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(124, "Password must be less than 124 characters"),
});

type RegisterSchema = z.infer<typeof registerSchema>;

type Props = {};

const Register = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { control, handleSubmit, formState } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const handleRegister = async ({ email, password, name }: RegisterSchema) => {
    setLoading(true);

    await authClient.signUp.email(
      { email, password, name },
      {
        onError: (error) => {
          setLoading(false);
          setError(error.error.message);
        },
        onSuccess: () => {
          setLoading(false);
          router.replace("/");
        },
      }
    );
  };

  return (
    <View className="flex-1 p-6">
      <KeyboardAvoidingView
        behavior={"padding"}
        className="flex-1 justify-center"
      >
        <View className="gap-4 self-center w-full max-w-sm">
          <Text className="pb-4 text-3xl font-bold text-center text-foreground">
            Register
          </Text>
          <Controller
            control={control}
            name="name"
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <>
                <Input
                  placeholder="Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
                {error && <Text className="text-red-500">{error.message}</Text>}
              </>
            )}
          />
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
            onPress={handleSubmit(handleRegister)}
            disabled={!formState.isValid || loading}
          >
            {loading ? (
              <ActivityIndicator className="text-foreground" />
            ) : (
              <Text className="text-center">Register</Text>
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
      <View className="items-center pb-4">
        <Button
          variant="link"
          onPress={() => router.push("/login")}
          className="p-0"
        >
          <Text className="text-center underline color-foreground">
            Login instead?
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default Register;

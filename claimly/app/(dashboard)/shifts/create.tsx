import { View, KeyboardAvoidingView, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "expo-router";
import { createApiClient } from "~/lib/api/clients";
import { authClient } from "~/lib/auth-client";
import * as chrono from "chrono-node";

const createShiftSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  start: z.string().refine(
    (val) => {
      const regex = /^\d{1,2}\.\d{1,2}\.\d{2}\s+\d{1,2}\s+Uhr$/;
      return regex.test(val);
    },
    {
      message: "Invalid date format. Use format like '10.10.25 10 Uhr'",
    }
  ),
  length: z.coerce
    .number({ invalid_type_error: "Length must be a number" })
    .int("Length must be a whole number")
    .positive("Length must be positive"),
  maxClaims: z.coerce
    .number({ invalid_type_error: "Max claims must be a number" })
    .int("Max claims must be a whole number")
    .positive("Max claims must be positive"),
});

type CreateShiftSchema = z.infer<typeof createShiftSchema>;

const CreateShift = () => {
  const { control, handleSubmit, formState, reset } =
    useForm<CreateShiftSchema>({
      resolver: zodResolver(createShiftSchema),
      mode: "onChange",
    });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: sessionData } = authClient.useSession();

  const shiftsApiClient = createApiClient("shifts", sessionData?.session);

  const handleCreateShift = async (data: CreateShiftSchema) => {
    if (!shiftsApiClient) return;
    setLoading(true);
    setError("");
    try {
      const start = chrono.de.parseDate(data.start);

      // TODO: fix hono client
      //   const res = await shiftsApiClient.index.$post({
      //     json: {
      //       name: data.name,
      //       start: new Date(start).getTime(),
      //       end: new Date(start).getTime() + data.length * 60 * 60 * 1000,
      //       maxClaims: data.maxClaims,
      //     },
      //   });
      //   if (res.ok) {
      //     router.back();
      //   }
      // } catch (error) {
      //   setError("An unexpected error occurred.");
      // } finally {
      //   setLoading(false);
      // }

      const response = await fetch("http://localhost:3001/shifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData?.session?.token}`,
        },
        body: JSON.stringify({
          name: data.name,
          start: new Date(start).getTime(),
          end: new Date(start).getTime() + data.length * 60 * 60 * 1000,
          maxClaims: data.maxClaims,
        }),
      });

      if (response.ok) {
        reset();
        router.back();
      } else {
        setError("Failed to create shift");
      }
    } catch (error) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6">
      <KeyboardAvoidingView
        behavior={"padding"}
        className="flex-1 justify-center"
      >
        <View className="gap-4 self-center w-full max-w-sm">
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
                  autoCapitalize="none"
                />
                {error && <Text className="text-red-500">{error.message}</Text>}
              </>
            )}
          />
          <Controller
            control={control}
            name="start"
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <>
                <Input
                  placeholder="Start (01.01.25 10 Uhr)"
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
            name="length"
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <>
                <Input
                  placeholder="Length (in hours)"
                  value={value?.toString()}
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
            name="maxClaims"
            render={({
              field: { onChange, value, onBlur },
              fieldState: { error },
            }) => (
              <>
                <Input
                  placeholder="Max Claims"
                  value={value?.toString()}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                />
                {error && <Text className="text-red-500">{error.message}</Text>}
              </>
            )}
          />
          {error && <Text className="text-red-500">{error}</Text>}
          <Button
            className="mt-4 w-full"
            onPress={handleSubmit(handleCreateShift)}
            disabled={!formState.isValid || loading}
          >
            {loading ? (
              <ActivityIndicator className="text-foreground" />
            ) : (
              <Text className="text-center">Create Shift</Text>
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreateShift;

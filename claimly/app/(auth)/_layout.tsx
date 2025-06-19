import { StyleSheet } from "react-native";
import * as React from "react";
import { Stack } from "expo-router";
import GuestOnly from "~/components/auth/GuestOnly";

type Props = {};

const AuthLayout = (props: Props) => {
  return (
    <GuestOnly>
      <Stack screenOptions={{ headerShown: false }} />
    </GuestOnly>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({});

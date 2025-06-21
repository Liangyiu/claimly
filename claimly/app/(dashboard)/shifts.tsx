import { StyleSheet, View } from "react-native";
import React, { useEffect, useLayoutEffect } from "react";
import { authClient } from "~/lib/auth-client";
import { Text } from "~/components/ui/text";
import { createApiClient } from "~/lib/api/clients";

type Props = {};

const Shifts = (props: Props) => {
  const { data: sessionData } = authClient.useSession();

  const shiftsApiClient = createApiClient("shifts", sessionData?.session);

  useLayoutEffect(() => {
    const fetchShifts = async () => {
      const response = await shiftsApiClient?.index.$get();
      console.log(response);
    };
    fetchShifts();
  }, []);

  return (
    <View>
      <Text>Shifts</Text>
    </View>
  );
};

export default Shifts;

const styles = StyleSheet.create({});

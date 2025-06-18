import { StyleSheet, Text, View } from "react-native";
import React from "react";

type Props = {};

const Home = (props: Props) => {
  return (
    <View className="items-center justify-center flex-1 bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});

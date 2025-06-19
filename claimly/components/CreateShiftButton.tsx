import { Pressable, View } from "react-native";
import { Plus } from "~/lib/icons/Plus";
import type { PressableProps } from "react-native";

export function CreateShiftButton({ onPress, ...props }: PressableProps) {
  return (
    <Pressable
      onPress={onPress}
      className="web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 active:opacity-70"
      {...props}
    >
      <View className="flex-1 aspect-square pt-0.5 justify-center items-start web:px-5">
        <Plus className="text-foreground" size={24} strokeWidth={1.5} />
      </View>
    </Pressable>
  );
}

import React from "react";
import { Pressable } from "react-native";
import { format, toZonedTime } from "date-fns-tz";
import { de } from "date-fns/locale/de";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Text } from "./ui/text";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

interface ShiftCardProps {
  name: string;
  startTime: string; // UTC timestamp in ms
  endTime: string; // UTC timestamp in ms
  claims: number;
  maxClaims: number;
  dontDisableCard?: boolean;
  onPress?: () => void;
}

const GERMAN_TIMEZONE = "Europe/Berlin";

const ShiftCard: React.FC<ShiftCardProps> = ({
  name,
  startTime,
  endTime,
  claims,
  maxClaims,
  onPress,
  dontDisableCard,
}) => {
  const { data: sessionData } = authClient.useSession();
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const zonedStart = toZonedTime(startDate, GERMAN_TIMEZONE);
  const formattedTime = format(zonedStart, "dd.MM.yyyy HH:mm", { locale: de });

  // Calculate duration in hours
  const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

  const isDisabled =
    claims >= maxClaims &&
    sessionData?.user?.role !== "admin" &&
    !dontDisableCard;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      <Card
        className={cn(
          "my-2 bg-foreground/5",
          isDisabled && "opacity-50",
          onPress && "cursor-pointer"
        )}
      >
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text>
            Start: <Text>{formattedTime}</Text>
          </Text>
          <Text>
            Duration: <Text>{duration} h</Text>
          </Text>
        </CardContent>
        <CardFooter>
          <Text>
            Claims: <Text>{`${claims}/${maxClaims}`}</Text>
          </Text>
        </CardFooter>
      </Card>
    </Pressable>
  );
};

export default ShiftCard;

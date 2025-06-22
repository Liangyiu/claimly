import React, { useState, useCallback, useLayoutEffect } from "react";
import { View, ActivityIndicator, FlatList, Alert } from "react-native";
import { Tabs, useLocalSearchParams } from "expo-router";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

interface Shift {
  id: string;
  name: string;
  start: string;
  end: string;
  maxClaims: number;
  claimsCount: number;
}

interface ShiftClaim {
  userId: string;
  shiftId: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

const ShiftDetails = () => {
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { data: sessionData } = authClient.useSession();
  const [shift, setShift] = useState<Shift | null>(null);
  const [claims, setClaims] = useState<ShiftClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [removingSelf, setRemovingSelf] = useState(false);

  // Find if the current user has already claimed this shift
  const userId = sessionData?.user?.id;
  const userClaim = claims.find((c) => c.userId === userId);
  const canClaim = !userClaim && shift && claims.length < shift.maxClaims;

  const fetchData = useCallback(async () => {
    if (!id) return;
    const token = sessionData?.session?.token;
    const baseUrl = "http://192.168.178.80:3001/shifts";
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const shiftRes = await fetch(`${baseUrl}/${id}`, { headers });
    const claimsRes = await fetch(`${baseUrl}/${id}/claims`, { headers });

    const shiftData = shiftRes.ok ? await shiftRes.json() : null;
    const claimsData = claimsRes.ok ? await claimsRes.json() : [];

    setShift(shiftData || null);
    setClaims(Array.isArray(claimsData) ? claimsData : []);
    setLoading(false);
  }, [id, sessionData]);

  useLayoutEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemove = async (userId: string) => {
    if (!id) return;
    setRemoving(userId);
    try {
      const token = sessionData?.session?.token;
      const baseUrl = "http://192.168.178.80:3001/shifts";
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${baseUrl}/${id}/claims/${userId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        setClaims((prev) => prev.filter((c) => c.userId !== userId));
      } else {
        Alert.alert("Error", "Failed to remove claim.");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to remove claim.");
    } finally {
      setRemoving(null);
    }
  };

  const handleClaim = async () => {
    if (!id) return;
    setClaiming(true);
    try {
      const token = sessionData?.session?.token;
      const baseUrl = "http://192.168.178.80:3001/shifts";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${baseUrl}/${id}/claims`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        await fetchData();
      } else {
        Alert.alert("Error", "Failed to claim shift.");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to claim shift.");
    } finally {
      setClaiming(false);
    }
  };

  const handleRemoveSelf = async () => {
    if (!id || !userId) return;
    setRemovingSelf(true);
    try {
      const token = sessionData?.session?.token;
      const baseUrl = "http://192.168.178.80:3001/shifts";
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${baseUrl}/${id}/claims/${userId}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        await fetchData();
      } else {
        Alert.alert("Error", "Failed to remove claim.");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to remove claim.");
    } finally {
      setRemovingSelf(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <>
      <Tabs.Screen options={{ title: "Shift Details" }} />
      <View className="p-4">
        {shift && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>{shift.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Text>Start: {new Date(shift.start).toLocaleString()}</Text>
              <Text>End: {new Date(shift.end).toLocaleString()}</Text>
              <Text>Max Claims: {shift.maxClaims}</Text>
            </CardContent>
          </Card>
        )}

        {/* Claim/Remove Claim Button */}
        {sessionData?.user &&
          (userClaim ? (
            <Button
              variant="destructive"
              className="mb-4"
              onPress={handleRemoveSelf}
              disabled={removingSelf}
            >
              <Text>{removingSelf ? "Removing..." : "Remove Claim"}</Text>
            </Button>
          ) : (
            <Button
              className="mb-4"
              onPress={handleClaim}
              disabled={!canClaim || claiming}
            >
              <Text>{claiming ? "Claiming..." : "Claim Shift"}</Text>
            </Button>
          ))}

        <Text className="mb-2 text-lg font-bold">Claims</Text>
        <FlatList
          data={claims}
          keyExtractor={(item) => item.userId}
          ListEmptyComponent={<Text>No claims for this shift.</Text>}
          renderItem={({ item }) => (
            <Card className="mb-2">
              <CardHeader>
                <CardTitle>{item.user?.name || "Unknown User"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Text>
                  Claimed at: {new Date(item.createdAt).toLocaleString()}
                </Text>
                <Text>Email: {item.user?.email}</Text>
                {sessionData?.user?.role === "admin" && (
                  <Button
                    variant="destructive"
                    className="mt-2"
                    disabled={removing === item.userId}
                    onPress={() => handleRemove(item.userId)}
                  >
                    <Text>
                      {removing === item.userId ? "Removing..." : "Remove"}
                    </Text>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        />
      </View>
    </>
  );
};

export default ShiftDetails;

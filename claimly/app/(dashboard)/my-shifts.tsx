import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";
import { Text } from "~/components/ui/text";
import { createApiClient } from "~/lib/api/clients";
import ShiftCard from "~/components/ShiftCard";
import { useRouter } from "expo-router";

// Represents a shift as returned by the backend API
export interface Shift {
  id: string;
  name: string;
  start: string;
  end: string;
  maxClaims: number;
  claimsCount: number;
  claim: {
    createdAt: string;
    userId: string;
    shiftId: string;
  };
}

const Shifts = () => {
  const { data: sessionData } = authClient.useSession();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 5;
  const claimsApiClient = createApiClient("claims", sessionData?.session);

  const fetchShifts = async (pageToFetch = 1, append = false) => {
    const response = await claimsApiClient?.index.$get({
      query: { page: pageToFetch.toString(), limit: LIMIT.toString() },
    });
    if (response?.ok) {
      const data = await response.json();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (append) {
        setShifts((prev) => [...prev, ...data.data]);
      } else {
        setShifts(data.data);
      }
      setHasMore(pageToFetch < data.pagination.totalPages);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchShifts(1, false);
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchShifts(nextPage, true);
    setPage(nextPage);
  };

  useLayoutEffect(() => {
    fetchShifts(1, false);
  }, []);

  return (
    <View className="p-2">
      <FlatList
        data={shifts}
        renderItem={({ item }: { item: Shift }) => (
          <ShiftCard
            name={item.name}
            startTime={item.start}
            endTime={item.end}
            claims={item.claimsCount}
            maxClaims={item.maxClaims}
            dontDisableCard={true}
            onPress={() => router.push(`/shifts/${item.id}`)}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !refreshing && !loadingMore ? (
            <Text className="text-sm text-center text-muted-foreground">
              No shifts found
            </Text>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              className="text-foreground"
              size="small"
              style={{ marginVertical: 10 }}
            />
          ) : !hasMore ? (
            <Text className="text-sm text-center text-muted-foreground">
              No more shifts
            </Text>
          ) : null
        }
        ListFooterComponentStyle={{
          paddingVertical: 20,
          alignItems: "center",
        }}
      />
    </View>
  );
};

export default Shifts;

const styles = StyleSheet.create({});

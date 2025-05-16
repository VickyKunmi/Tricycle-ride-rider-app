import RideLayout from "@/components/RideLayout";
import RideMap from "@/components/RideMap";
import TrackMap from "@/components/TrackMap";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView, Text, StyleSheet, View } from "react-native";

const TrackRide = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <RideLayout title="Track ride">
        <View style={styles.mapContainer}>
          {/* <RideMap /> */}
          <TrackMap />
        </View>
      </RideLayout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  text: { fontSize: 18 },
  id: { fontSize: 20, fontWeight: "700", marginTop: 8 },

  mapContainer: {
    height: 500,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
});

export default TrackRide;

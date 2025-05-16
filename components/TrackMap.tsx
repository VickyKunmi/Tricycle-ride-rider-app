import React, { useState, useEffect, useContext } from "react";
import {
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  View,
  Button,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_ENDPOINT } from "@/apiConfig";
import { icons } from "@/constants";
import { AuthContext } from "@/contexts/AuthContext";

const TrackMap = () => {
      const { token } = useContext(AuthContext);
    
  const { id: rideId } = useLocalSearchParams<{ id: string }>();

  const [pickupLocation, setPickupLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [destinationLocation, setDestinationLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [riderLocation, setRiderLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [isAtCustomer, setIsAtCustomer] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!rideId) return;

    const fetchRideData = async () => {
      try {
        const res = await fetch(`${API_ENDPOINT}/api/ride/${rideId}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const ride = await res.json();

        setPickupLocation({
          latitude: ride.origin_latitude,
          longitude: ride.origin_longitude,
        });

        setDestinationLocation({
          latitude: ride.destination_latitude,
          longitude: ride.destination_longitude,
        });

        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 1 },
          ({ coords }) => {
            const loc = {
              latitude: coords.latitude,
              longitude: coords.longitude,
            };
            setRiderLocation(loc);

            const d = getDistance(
              loc.latitude,
              loc.longitude,
              ride.origin_latitude,
              ride.origin_longitude
            );
            setIsAtCustomer(d < 50);
          }
        );

        return () => sub.remove();
      } catch (err) {
        console.error("fetchRideData:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRideData();
  }, [rideId]);

  const getDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371e3; // m
    const φ1 = toRad(lat1),
      φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1),
      Δλ = toRad(lon2 - lon1);
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleStartTrip = async () => {
    await fetch(`${API_ENDPOINT}/api/ride/${rideId}/start`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      
    
    router.push({
      pathname: "/(root)/trip-screen",
      params: {
        id: rideId,
        originLat: pickupLocation.latitude.toString(),
        originLng: pickupLocation.longitude.toString(),
        destinationLat: destinationLocation.latitude.toString(),
        destinationLng: destinationLocation.longitude.toString(),
        riderLat: riderLocation.latitude.toString(),
        riderLng: riderLocation.longitude.toString(),
      },
    });
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── DEV-ONLY: simulate arrival ─── */}
      {__DEV__ && !isAtCustomer && (
        <View style={styles.devButton}>
          <Button
            title="Simulate Arrival"
            onPress={() => {
              setRiderLocation(pickupLocation);
              setIsAtCustomer(true);
            }}
          />
        </View>
      )}

      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: riderLocation.latitude,
          longitude: riderLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        <Marker coordinate={riderLocation} title="You (rider)" image={icons.selectedMarker}/>
        <Marker coordinate={pickupLocation} title="Pickup here" image={icons.marker} />
        <Polyline
          coordinates={[riderLocation, pickupLocation]}
          strokeColor="#1E90FF"
          strokeWidth={4}
        />
      </MapView>

      {isAtCustomer && (
        <View style={styles.buttonContainer}>
          <Button title="Start Trip" onPress={handleStartTrip} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    left: "50%",
    transform: [{ translateX: -75 }],
    width: 150,
  },
  devButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 4,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default TrackMap;

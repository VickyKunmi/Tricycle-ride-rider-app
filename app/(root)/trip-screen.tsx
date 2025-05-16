import React, { useState, useEffect, useContext } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Button,
  ActivityIndicator,
  Text,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AuthContext } from "@/contexts/AuthContext";
import { API_ENDPOINT } from "@/apiConfig";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import axios from "axios";
import { io } from "socket.io-client";

type TripParams = {
  id: string;
  originLat: string;
  originLng: string;
  destinationLat: string;
  destinationLng: string;
};

export default function TripScreen() {
  const { token } = useContext(AuthContext);
  const {
    id: rideId,
    originLat,
    originLng,
    destinationLat,
    destinationLng,
  } = useLocalSearchParams<TripParams>();
  const router = useRouter();

  const origin = {
    latitude: parseFloat(originLat),
    longitude: parseFloat(originLng),
  };
  const destination = {
    latitude: parseFloat(destinationLat),
    longitude: parseFloat(destinationLng),
  };

  const socket = io(API_ENDPOINT);

  useEffect(() => {
    let sub: Location.LocationSubscription;
    (async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;

      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        ({ coords }) => {
          socket.emit("driver:location", {
            rideId,
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        }
      );
    })();
    return () => sub?.remove();
  }, [rideId]);

  const [riderLoc, setRiderLoc] = useState(origin);
  const [loading, setLoading] = useState(true);
  const [arrived, setArrived] = useState(false);
  const [canComplete, setCanComplete] = useState(false);
  const [farePrice, setFarePrice] = useState<number | null>(null);

  useEffect(() => {
    let sub: Location.LocationSubscription;
    (async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        ({ coords }) => {
          const here = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
          setRiderLoc(here);

          const d = getDistance(
            coords.latitude,
            coords.longitude,
            destination.latitude,
            destination.longitude
          );
          if (d < 30) setArrived(true);
        }
      );
      setLoading(false);
    })();
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    if (arrived && farePrice !== null) {
      if (__DEV__) {
        setCanComplete(true);

        socket.emit("ride:arrived", {
          rideId,
          fare: farePrice,
        });

        return;
      }

      const t = setTimeout(() => {
        setCanComplete(true);

        socket.emit("ride:arrived", {
          rideId,
          fare: farePrice,
        });
      }, 2 * 60 * 1000);
      return () => clearTimeout(t);
    }
  }, [arrived, farePrice]);

  const handleComplete = async () => {
    try {
      await axios.patch(
        `${API_ENDPOINT}/api/ride/${rideId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Trip completed.");

      router.replace({
        pathname: "/(root)/(tabs)/home",
        params: { tab: "completed" },
      });
    } catch (err: any) {
      console.error("Complete Ride Error", err);
      Alert.alert("Error", err.response?.data?.message || err.message);
    }
  };

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await axios.get(`${API_ENDPOINT}/api/ride/${rideId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFarePrice(res.data.fare_price);
      } catch (err: any) {
        console.error("Error fetching ride fare", err);
      }
    };

    fetchRide();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RideLayout title="Track & Complete">
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={{
              ...riderLoc,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
          >
            <Marker coordinate={riderLoc} title="You" image={icons.marker} />
            <Marker
              coordinate={destination}
              title="Destination"
              image={icons.selectedMarker}
            />
            <Polyline
              coordinates={[riderLoc, destination]}
              strokeWidth={4}
              strokeColor="#0A84FF"
            />
          </MapView>
        </View>

        {__DEV__ && !arrived && (
          <View style={styles.devButton}>
            <Button title="Force Arrive" onPress={() => setArrived(true)} />
          </View>
        )}

        {arrived && (
          <View style={styles.buttonWrapper}>
            {farePrice !== null && (
              <Text style={{ textAlign: "center", marginBottom: 8 }}>
                Fare: ₵{farePrice.toFixed(2)}
              </Text>
            )}
            {canComplete ? (
              <Button title="Complete Ride" onPress={handleComplete} />
            ) : (
              <Text style={{ textAlign: "center", marginTop: 8 }}>
                Finishing up… button in 2 min
              </Text>
            )}
          </View>
        )}
      </RideLayout>
    </SafeAreaView>
  );
}

const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371e3;
  const φ1 = toRad(lat1),
    φ2 = toRad(lat2),
    Δφ = toRad(lat2 - lat1),
    Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const styles = StyleSheet.create({
  mapContainer: { flex: 1, borderRadius: 20, overflow: "hidden", margin: 16 },
  map: { flex: 1 },
  buttonWrapper: { padding: 16 },
  devButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
});

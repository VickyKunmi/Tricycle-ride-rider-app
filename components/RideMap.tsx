import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
  Region,
  UrlTile,
} from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { API_ENDPOINT } from "@/apiConfig";
import { useLocationStore } from "@/store";
import { icons } from "@/constants";
import MapViewDirections from "react-native-maps-directions";

const RideMap: React.FC = () => {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const { id } = useLocalSearchParams<{ id: string }>();

  const [instructions, setInstructions] = useState<
    { distance: number; instruction: string }[]
  >([]);

  const [riderLocation, setRiderLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [customerLocation, setCustomerLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: userLatitude ?? 0,
    longitude: userLongitude ?? 0,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // 1. Rider’s GPS
        const loc = await Location.getCurrentPositionAsync();
        const riderCoords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setRiderLocation(riderCoords);

        // 2. Fetch ride data from your backend
        const { data: ride } = await axios.get(
          `${API_ENDPOINT}/api/ride/${id}`
        );
        const customerCoords = {
          latitude: ride.origin_latitude,
          longitude: ride.origin_longitude,
        };
        setCustomerLocation(customerCoords);

        // 3. Fetch directions using Google Directions API
        const googleAPIKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${riderCoords.latitude},${riderCoords.longitude}&destination=${customerCoords.latitude},${customerCoords.longitude}&key=${googleAPIKey}&alternatives=false`;

        const routeRes = await axios.get(url);

        // Parse route instructions (Google Maps Response)
        const route = routeRes.data.routes[0];
        const steps = route.legs[0].steps;
        const navigationInstructions = steps.map((step: any) => ({
          distance: step.distance.value, // Distance in meters
          instruction: step.html_instructions, // Google maps provides HTML formatted instructions
        }));

        setInstructions(navigationInstructions);

        // Convert the polyline (Google gives encoded polyline)
        const coords = decodePolyline(route.overview_polyline.points).map(
          ([lat, lng]: [number, number]) => ({
            latitude: lat,
            longitude: lng,
          })
        );
        setRouteCoords(coords);
      } catch (error) {
        console.error("Error fetching ride or route:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [id]);

  // Function to decode the polyline
  const decodePolyline = (encoded: string) => {
    let index = 0;
    const decoded: [number, number][] = [];
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 0xffff;
      lat += dlat & 0x8000 ? dlat - 0x10000 : dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 0xffff;
      lng += dlng & 0x8000 ? dlng - 0x10000 : dlng;

      decoded.push([lat / 1e5, lng / 1e5]);
    }

    return decoded;
  };

  const directionsAPI = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

  if (loading || !riderLocation || !customerLocation) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
      </SafeAreaView>
    );
  }

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "");

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        mapType="standard"
        userInterfaceStyle="light"
      >
        <Marker
          coordinate={riderLocation}
          title="Your Location"
          image={icons.selectedMarker}
        />

        <Marker coordinate={customerLocation} title="Customer Pickup" />

        <MapViewDirections
          origin={{
            latitude: userLatitude!,
            longitude: userLongitude!,
          }}
          destination={{
            latitude: customerLocation.latitude,
            longitude: customerLocation.longitude,
          }}
          apikey={directionsAPI!}
          strokeColor="#0286ff"
          strokeWidth={2}
        />
      </MapView>
      <View style={styles.instructionsContainer}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Directions:</Text>
        <ScrollView>
          {instructions.map((step, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text key={index} style={styles.instructionText}>
                {index + 1}. {stripHtml(step.instruction)} (
                {(step.distance / 1000).toFixed(1)} km)
              </Text>
              
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1, borderRadius: 16 },
  instructionsContainer: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff",
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },

  instructionItem: {
    marginBottom: 10,
  },

  instructionDistance: {
    fontSize: 12,
    color: "#777",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default RideMap;

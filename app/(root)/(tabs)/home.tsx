import React, { useContext, useEffect, useState } from "react";
import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import axios from "axios";
import { io } from "socket.io-client";
import { AuthContext } from "@/contexts/AuthContext";
import { useLocationStore } from "@/store";
import { API_ENDPOINT } from "@/apiConfig";
import { icons } from "@/constants";
import useDriverSocket from "@/hooks/useDriverSocket";

const socket = io(API_ENDPOINT);

interface Ride {
  _id: string;
  origin_address: string;
  destination_address: string;
  fare_price?: number;
  status?: string;
  completed_at: Date;

  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
}

const Home = () => {
  const { user, token, signOut } = useContext(AuthContext);
  const router = useRouter();
  const setUserLocation = useLocationStore((s) => s.setUserLocation);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [unassignedRides, setUnassignedRides] = useState<Ride[]>([]);
  const [completedRides, setCompletedRides] = useState<Ride[]>([]);
  const [assignedRides, setAssignedRides] = useState<Ride[]>([]);
  const [transitRides, setTransitRides] = useState<Ride[]>([]);

  const [selectedTab, setSelectedTab] = useState<
    "unassigned" | "assigned" | "in-transit" | "completed"
  >("unassigned");

  const fetchRides = async () => {
    try {
      const [completedRes, unassignedRes, assignedRes, transitRes] =
        await Promise.all([
          axios.get(
            `${API_ENDPOINT}/api/ride/driver/${user?.id}?status=completed`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(`${API_ENDPOINT}/api/ride/unassigned`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `${API_ENDPOINT}/api/ride/driver/${user?.id}?status=assigned`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            `${API_ENDPOINT}/api/ride/driver/${user?.id}?status=in_transit`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

      setCompletedRides(completedRes.data);
      setAssignedRides(assignedRes.data);
      setUnassignedRides(unassignedRes.data);
      setTransitRides(transitRes.data);
    } catch (err) {
      console.error("Error fetching rides", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const handleAssign = async (rideId: string) => {
    try {
      await axios.patch(
        `${API_ENDPOINT}/api/ride/${rideId}/assign`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Ride has been successfully assigned.");
      fetchRides();
    } catch (err: any) {
      if (err.response?.status === 401) {
        Alert.alert("Session expired", "Please log in again.");
        signOut();
        router.replace("/(auth)/sign-in");
      } else {
        console.error("Error assigning ride", err);
        Alert.alert("Error", "Could not assign the ride. Please try again.");
      }
    }
  };

  useDriverSocket(fetchRides);

  const handleCancelRide = async (rideId: string) => {
    try {
      await axios.patch(
        `${API_ENDPOINT}/api/ride/${rideId}/cancelAssign`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchRides();
      Alert.alert("Success", "Ride has been cancelled.");
    } catch (err: any) {
      if (err.response?.status === 401) {
        Alert.alert("Session expired, please log in again.");
        signOut();
        router.replace("/(auth)/sign-in");
      } else {
        console.error("Error cancelling ride", err);
        Alert.alert("Error", "Could not cancel the ride. Please try again.");
      }
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === "granted");
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync();
        const [place] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        const address = [
          place.name,
          place.street,
          place.district,
          place.city,
          place.region,
          place.country,
        ]
          .filter(Boolean)
          .join(", ");
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          address,
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (hasPermission) fetchRides();
  }, [hasPermission]);

  useEffect(() => {
    socket.on("rides:update", fetchRides);

    return () => {
      socket.off("rides:update");
    };
  }, []);

  if (hasPermission === null)
    return (
      <View style={styles.msg}>
        <Text>Checking permissions…</Text>
      </View>
    );
  if (!hasPermission)
    return (
      <View style={styles.msg}>
        <Text>Please allow location to continue.</Text>
        <TouchableOpacity
          onPress={() => setHasPermission(null)}
          style={styles.btn}
        >
          <Text style={styles.btnText}>Allow Location</Text>
        </TouchableOpacity>
      </View>
    );
  if (loading)
    return (
      <View style={styles.msg}>
        <Text>Loading rides…</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      {/* TABS */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Welcome {user?.fullName} 👋</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Image source={icons.out} style={styles.signOutIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.tabs}>
        {["unassigned", "assigned", "in-transit", "completed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab as any)}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.tabButtonActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === "unassigned"
                ? "Unassigned Rides"
                : tab === "assigned"
                ? "Assigned Rides"
                : tab === "in-transit"
                ? "In-transit"
                : "Completed Rides"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === "unassigned" ? (
        unassignedRides.length === 0 ? (
          <View style={styles.msg}>
            <Text>No unassigned rides available.</Text>
          </View>
        ) : (
          <FlatList
            data={unassignedRides}
            keyExtractor={(r) => r._id}
            renderItem={({ item }) => (
              <View style={styles.rideCard}>
                <Text>
                  {item.origin_address} ➡ {item.destination_address}
                </Text>
                <Text>Fare: GHS {item.fare_price}</Text>
                <TouchableOpacity
                  onPress={() => handleAssign(item._id)}
                  style={styles.assignBtn}
                >
                  <Text style={styles.btnText}>Assign Ride</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )
      ) : selectedTab === "assigned" ? (
        assignedRides.length === 0 ? (
          <View style={styles.msg}>
            <Text>No assigned rides available.</Text>
          </View>
        ) : (
          <FlatList
            data={assignedRides}
            keyExtractor={(r) => r._id}
            renderItem={({ item }) => (
              <View style={styles.rideCard}>
                <Text>
                  {item.origin_address} ➡ {item.destination_address}
                </Text>
                <Text>Status: {item.status}</Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/(track)/[id]",
                      params: { id: item._id },
                    })
                  }
                  style={styles.assignBtn}
                >
                  <Text style={styles.btnText}>Track Ride</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleCancelRide(item._id)}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.btnText}>Cancel Ride</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )
      ) : selectedTab === "in-transit" ? (
        transitRides.length === 0 ? (
          <View style={styles.msg}>
            <Text>No available rides in transit.</Text>
          </View>
        ) : (
          <FlatList
            data={transitRides}
            keyExtractor={(r) => r._id}
            renderItem={({ item }) => (
              <View style={styles.rideCard}>
                <Text>
                  {item.origin_address} ➡ {item.destination_address}
                </Text>
                <Text>Status: {item.status}</Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/trip-screen",
                      params: {
                        id: item._id,
                        originLat: String(item.origin_latitude),
                        originLng: String(item.origin_longitude),
                        destinationLat: String(item.destination_latitude),
                        destinationLng: String(item.destination_longitude),
                      },
                    })
                  }
                  style={styles.assignBtn}
                >
                  <Text style={styles.btnText}>Track Ride</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )
      ) : completedRides.length === 0 ? (
        <View style={styles.msg}>
          <Text>No completed rides available.</Text>
        </View>
      ) : (
        <FlatList
          data={completedRides}
          keyExtractor={(r) => r._id}
          renderItem={({ item }) => (
            <View style={styles.rideCard}>
              <Text>
                {item.origin_address} ➡ {item.destination_address}
              </Text>
              <Text>
                Completed at: {new Date(item.completed_at).toLocaleTimeString()}
              </Text>
              <Text>Status: {item.status}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 16 },
  msg: { flex: 1, justifyContent: "center", alignItems: "center" },
  btn: { marginTop: 10, backgroundColor: "blue", padding: 10, borderRadius: 5 },
  btnText: { color: "white" },

  // tabs row
  tabs: { flexDirection: "row", marginBottom: 12 },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: { borderBottomColor: "#2563eb" },
  tabText: { fontSize: 12, color: "#000", fontWeight: "bold" },
  tabTextActive: { color: "#2563eb", fontWeight: "600" },

  rideCard: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    elevation: 2,
  },
  cancelBtn: {
    marginTop: 6,
    backgroundColor: "#FF0000",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },

  assignBtn: {
    marginTop: 6,
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 16,
  },
  title: { fontSize: 24, fontWeight: "800" },
  signOutBtn: { backgroundColor: "#FFF", padding: 8, borderRadius: 20 },
  signOutIcon: { width: 16, height: 16 },
});
export default Home;

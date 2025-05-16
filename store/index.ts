import { getDistanceKm } from "@/lib/distance";
import { LocationStore } from "@/types/types";
import {create} from "zustand"

export const useLocationStore = create<LocationStore>((set, get) => ({
    userLatitude: null,
    userLongitude: null,
    userAddress: null,
    destinationLatitude: null,
    destinationLongitude: null,
    destinationAddress: null,
    estimatedFare: 0,
    estimatedTime: 0,
  
    setUserLocation: ({ latitude, longitude, address }) =>
      set({ userLatitude: latitude, userLongitude: longitude, userAddress: address }),
  
    setDestinationLocation: ({ latitude, longitude, address }) => {
      const { userLatitude, userLongitude } = get();
      if (userLatitude == null || userLongitude == null) {
        return set({ destinationLatitude: latitude, destinationLongitude: longitude, destinationAddress: address });
      }
  
      const distanceKm = getDistanceKm(userLatitude, userLongitude, latitude, longitude);
      const baseFare = 2.0;
      const perKmRate = 1.5;
      const fare = baseFare + perKmRate * distanceKm;
      const avgSpeedKmh = 25;
      const timeMin = (distanceKm / avgSpeedKmh) * 60;
  
      set({
        destinationLatitude: latitude,
        destinationLongitude: longitude,
        destinationAddress: address,
       
      });
    },
  
  
  }));
  
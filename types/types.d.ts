import { TextInputProps, TouchableOpacityProps } from "react-native";

declare interface ButtonProps extends TouchableOpacityProps {
    title: string;
    bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
    textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
    IconLeft?: React.ComponentType<any>;
    IconRight?: React.ComponentType<any>;
    className?: string;
  }



  declare interface InputFieldProps extends TextInputProps {
    label: string;
    icon?: any;
    secureTextEntry?: boolean;
    labelStyle?: string;
    containerStyle?: string;
    inputStyle?: string;
    iconStyle?: string;
    className?: string;
  }



  declare interface LocationStore {
    userLatitude: number | null;
    userLongitude: number | null;
    userAddress: string | null;
    destinationLatitude: number | null;
    destinationLongitude: number | null;
    destinationAddress: string | null;
    // estimatedFare: number;
    // estimatedTime: number;
    // setEstimatedFare: (fare: number) => void;
    // setEstimatedTime: (time: number) => void;
    setUserLocation: ({
      latitude,
      longitude,
      address,
    }: {
      latitude: number;
      longitude: number;
      address: string;
    }) => void;
    setDestinationLocation: ({
      latitude,
      longitude,
      address,
    }: {
      latitude: number;
      longitude: number;
      address: string;
    }) => void;
  }
  
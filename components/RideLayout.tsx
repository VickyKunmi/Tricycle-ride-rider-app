import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { icons } from "@/constants";

const RideLayout = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: 60,
            paddingHorizontal: 20,
            paddingBottom: 16,
            backgroundColor: "white",
            zIndex: 10,
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: "white",
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Image
                source={icons.backArrow}
                resizeMode="contain"
                style={{ width: 24, height: 24 }}
              />
            </View>
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              marginLeft: 16,
              fontFamily: "JakartaSemiBold",
            }}
          >
            {title || "Go Back"}
          </Text>
        </View>

        {/* Main content */}
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </GestureHandlerRootView>
  );
};

export default RideLayout;

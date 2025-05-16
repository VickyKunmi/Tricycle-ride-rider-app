import React, { useContext } from "react";

import { useState } from "react";
import { Alert, ScrollView, View, Image, Text } from "react-native";
import { Link, router, useRouter } from "expo-router";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { API_ENDPOINT } from "@/apiConfig";
import { AuthContext } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignIn = () => {
  const { signIn } = useContext(AuthContext);
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const onLoginPress = async () => {
    try {
      await signIn(form.username, form.password);
      router.push(`/(root)/(tabs)/home`);
    } catch (err: any) {
      if (err.message.includes("Session expired")) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again."
        );

        await AsyncStorage.removeItem("jwtToken");

        router.push("/sign-in");
      } else {
        Alert.alert("Error", err.message);
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image
            source={images.signUpTricycle}
            className="z-0 w-full h-[250px]"
          />
          <Text className="text-2xl text-white font-JakartaSemiBold absolute bottom-5 left-5">
            Welcome 👋
          </Text>
        </View>

        {/* Login Form */}
        <View className="p-5">
          <InputField
            label="Username"
            placeholder="Enter your username"
            value={form.username}
            onChangeText={(value) => setForm({ ...form, username: value })}
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton
            title="Sign In"
            onPress={onLoginPress}
            className="mt-6"
          />

          <Link
            href="/sign-up"
            className="text-lg text-center text-blue-500 mt-10"
          >
            Don't have an account?{" "}
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;

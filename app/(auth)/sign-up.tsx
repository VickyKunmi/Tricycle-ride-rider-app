import React, { useState } from "react";
import { Alert, Button, Image, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Link, router } from "expo-router";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { API_ENDPOINT } from "@/apiConfig";

import type { ImagePickerAsset } from "expo-image-picker";

const SignUp = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    username: "",
    password: "",
    tricycleNumberPlate: "",
    tricycleModel: "",
    tricycleColor: "",
  });

  const [image, setImage] = useState<ImagePickerAsset | null>(null);
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Please grant camera roll permissions."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const onSignUpPress = async () => {
    for (const [key, value] of Object.entries(form)) {
      if (!value) {
        Alert.alert("Error", `Please fill in your ${key}.`);
        return;
      }
    }
    if (!image) {
      Alert.alert("Error", "Please select a profile picture.");
      return;
    }

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });

    data.append("image", {
      uri: image.uri,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await fetch(`${API_ENDPOINT}/api/rider/register`, {
        method: "POST",
        body: data,
      });

      const resData = await response.json();
      if (response.ok) {
        Alert.alert("Success", resData.message, [
          { text: "OK", onPress: () => router.push("/sign-in") },
        ]);
      } else {
        Alert.alert(
          "Registration Error",
          resData.message || "Something went wrong."
        );
      }
    } catch (error) {
      console.error("Error during registration:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <View className="p-5">
          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            value={form.fullName}
            onChangeText={(text) => setForm({ ...form, fullName: text })}
          />
          <InputField
            label="Email"
            placeholder="Enter your email"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
          />
          <InputField
            label="Phone"
            placeholder="Enter your phone number"
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
            keyboardType="phone-pad"
          />
          <InputField
            label="Address"
            placeholder="Enter your address"
            value={form.address}
            onChangeText={(text) => setForm({ ...form, address: text })}
          />
          <InputField
            label="Username"
            placeholder="Choose a username"
            value={form.username}
            onChangeText={(text) => setForm({ ...form, username: text })}
          />
          <InputField
            label="Password"
            placeholder="Enter your password"
            value={form.password}
            secureTextEntry
            onChangeText={(text) => setForm({ ...form, password: text })}
          />
          <Button title="Pick a Profile Picture" onPress={pickImage} />
          {image && (
            <Image
              source={{ uri: image.uri }}
              style={{ width: 100, height: 100, marginVertical: 10 }}
            />
          )}
        </View>
      );
    } else if (step === 2) {
      return (
        <View className="p-5">
          <InputField
            label="Tricycle Number Plate"
            placeholder="Enter your tricycle number plate"
            value={form.tricycleNumberPlate}
            onChangeText={(text) =>
              setForm({ ...form, tricycleNumberPlate: text })
            }
          />
          <InputField
            label="Tricycle Model"
            placeholder="Enter your tricycle model"
            value={form.tricycleModel}
            onChangeText={(text) => setForm({ ...form, tricycleModel: text })}
          />
          <InputField
            label="Tricycle Color"
            placeholder="Enter your tricycle color"
            value={form.tricycleColor}
            onChangeText={(text) => setForm({ ...form, tricycleColor: text })}
          />
        </View>
      );
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
          <Text className="text-2xl text-white font-JakartaSemiBold absolute bottom-20 left-5">
            Create Your Account
          </Text>
          <Text className="text-2xl text-white font-JakartaSemiBold absolute bottom-5 left-5">
            {step === 1 ? "Personal Information" : "Tricycle Details"}
          </Text>
        </View>
        {renderStep()}
        <View className="p-5 flex-row justify-between">
          {step > 1 && (
            <CustomButton
              title="Back"
              onPress={() => setStep(step - 1)}
              className="flex-1"
            />
          )}
          {step < totalSteps && (
            <CustomButton
              title="Next"
              onPress={() => setStep(step + 1)}
              className="flex-1 ml-2"
            />
          )}
          {step === totalSteps && (
            <CustomButton
              title="Sign Up"
              onPress={onSignUpPress}
              className="flex-1 ml-2"
            />
          )}
        </View>
        <Link
          href="/sign-in"
          className="text-lg text-center text-blue-500 mt-10"
        >
          Already have an account? Log In
        </Link>
      </View>
    </ScrollView>
  );
};

export default SignUp;

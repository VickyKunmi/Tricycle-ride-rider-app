import InputField from "@/components/InputField";
import { AuthContext } from "@/contexts/AuthContext";
import React, { useContext } from "react";
import { View } from "react-native";
import { ScrollView, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const profile = () => {
  const { user } = useContext(AuthContext);
  console.log("Rider Image URL:", user?.image);

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="flex items-center justify-center my-5">
          <Image
            source={{
              uri: user?.image,
            }}
            style={{ width: 110, height: 110, borderRadius: 110 / 2 }}
            className=" rounded-full h-[110px] w-[110px] border-[3px] border-white shadow-sm shadow-neutral-300"
          />
        </View>

        <Text className="text-2xl font-JakartaBold my-5">My profile</Text>
        <View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3">
          <View className="flex flex-col items-start justify-start w-full">
            <InputField
              label="Full name"
              placeholder={user?.fullName || "Not Found"}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Email"
              placeholder={user?.email || "Not Found"}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Phone"
              placeholder={user?.phone || "Not Found"}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default profile;

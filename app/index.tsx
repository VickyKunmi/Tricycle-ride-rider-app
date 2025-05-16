import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { AuthContext } from "../contexts/AuthContext";
import "react-native-get-random-values";

const Page = () => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  return token ? (
    <Redirect href="/(root)/(tabs)/home" />
  ) : (
    <Redirect href="/(auth)/welcome" />
  );
};

export default Page;

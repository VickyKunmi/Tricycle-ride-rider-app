import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_ENDPOINT } from "@/apiConfig";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  image: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextData>({
  user: null,
  token: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // const signIn = async (username: string, password: string) => {
  //   const { token: jwtToken, user: userData } = (
  //     await axios.post(`${API_ENDPOINT}/api/rider/login`, {
  //       username,
  //       password,
  //     })
  //   ).data;

  //   // persist both pieces of state
  //   await AsyncStorage.multiSet([
  //     ["jwtToken", jwtToken],
  //     ["userData", JSON.stringify(userData)],
  //   ]);

  //   setToken(jwtToken);
  //   setUser(userData);
  // };




  
  const signIn = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/api/rider/login`, {
        username,
        password,
      });
  
      const { token: jwtToken, user: userData } = response.data;
  
      await AsyncStorage.multiSet([
        ["jwtToken", jwtToken],
        ["userData", JSON.stringify(userData)],
      ]);
  
      setToken(jwtToken);
      setUser(userData);
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        // Forward the backend error message
        throw new Error(error.response.data.message || "Login failed");
      } else {
        // Fallback message for unknown errors
        throw new Error("Something went wrong during login");
      }
    }
  };

  


  
  const signOut = async () => {
    await AsyncStorage.multiRemove(["jwtToken", "userData"]);
    setUser(null);
    setToken(null);
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const [storedToken, storedUserJson] = await Promise.all([
        AsyncStorage.getItem("jwtToken"),
        AsyncStorage.getItem("userData"),
      ]);
      if (storedToken && storedUserJson) {
        setToken(storedToken);
        setUser(JSON.parse(storedUserJson));
      }
      setLoading(false);
    };
    loadSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

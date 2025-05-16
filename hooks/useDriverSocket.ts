
import { useEffect, useContext, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { AuthContext } from "@/contexts/AuthContext";
import { API_ENDPOINT } from "@/apiConfig";

export default function useDriverSocket(onUpdate: () => void) {
  const { user, token } = useContext(AuthContext);
  const socketRef = useRef<Socket>();

  useEffect(() => {
    if (!token || !user?.id) return;

    const socket = io(API_ENDPOINT, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
     
      socket.emit("register", { userId: user.id });
    });

   
    socket.on("rides:update", onUpdate);

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  return socketRef.current;
}

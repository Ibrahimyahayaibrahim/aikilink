import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only establish a connection if the user is authenticated
    if (user && token) {
      const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
        auth: { token }
      });
      
      setSocket(newSocket);

      // Cleanup function: disconnect when the component unmounts or token changes
      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      // If the user logs out, kill the connection
      socket.disconnect();
      setSocket(null);
    }
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

// Custom hook to easily grab the socket in any component
export const useSocket = () => useContext(SocketContext);
import { createContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    // Clean up existing socket if user is not authenticated
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        console.log('Disconnecting socket - user not authenticated');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Don't create a new socket if one already exists and is connected
    if (socketRef.current && socketRef.current.connected) {
      console.log('Socket already connected, skipping new connection');
      return;
    }

    const token = localStorage.getItem('token');
    
    // Get the WebSocket URL, fallback to API URL without /api, or default
    let wsUrl = import.meta.env.VITE_WS_URL;
    if (!wsUrl) {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        // Remove /api from the end if present
        wsUrl = apiUrl.replace(/\/api$/, '');
      } else {
        wsUrl = 'http://localhost:5000';
      }
    }
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    const newSocket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      extraHeaders: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setSocket(newSocket);
      
      // Authenticate the socket if we have a token
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Authenticating socket...');
        newSocket.emit('authenticate', token);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setConnected(false);
      
      // Only clear socket if it's a manual disconnect or connection refused
      if (reason === 'io client disconnect' || reason === 'io server disconnect') {
        setSocket(null);
        socketRef.current = null;
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    newSocket.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
      setConnected(true);
    });

    newSocket.on('authentication_error', (error) => {
      console.error('Socket authentication error:', error);
    });

    socketRef.current = newSocket;

    // Cleanup function
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
    };
  }, [isAuthenticated, user]);

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event) => {
    if (socket) {
      socket.off(event);
    }
  };

  const authenticate = () => {
    if (socket && socket.connected) {
      const token = localStorage.getItem('token');
      if (token) {
        socket.emit('authenticate', token);
      }
    }
  };

  const value = {
    socket,
    connected,
    emit,
    on,
    off,
    authenticate
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext }; 
import { useEffect, useCallback, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './useAuth';

// Tipos para los eventos de Socket.IO
interface SocketMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  metadata?: any;
  timestamp: string;
  isRead: boolean;
}

interface UserJoinedLeft {
  userId: string;
  userName: string;
  timestamp: string;
}

interface MessageDelivered {
  temporaryId?: string;
  messageId: string;
  timestamp: string;
}

interface MessageError {
  error: string;
  code: string;
}

interface MessagesRead {
  readBy: string;
  messageIds: string[];
  timestamp: string;
}

export interface UseSocketReturn {
  socket: any | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  // Eventos de mensajería
  onReceiveMessage: (callback: (message: SocketMessage) => void) => void;
  onMessageDelivered: (callback: (data: MessageDelivered) => void) => void;
  onMessageError: (callback: (error: MessageError) => void) => void;
  onMessagesRead: (callback: (data: MessagesRead) => void) => void;
  onUserJoined: (callback: (data: UserJoinedLeft) => void) => void;
  onUserLeft: (callback: (data: UserJoinedLeft) => void) => void;
  // Acciones
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (data: {
    conversationId: string;
    content: string;
    messageType?: 'text' | 'image' | 'file';
    metadata?: any;
  }) => void;
  markAsRead: (data: { conversationId: string; messageIds: string[] }) => void;
  clearError: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbacksRef = useRef<{
    onReceiveMessage?: (message: SocketMessage) => void;
    onMessageDelivered?: (data: MessageDelivered) => void;
    onMessageError?: (error: MessageError) => void;
    onMessagesRead?: (data: MessagesRead) => void;
    onUserJoined?: (data: UserJoinedLeft) => void;
    onUserLeft?: (data: UserJoinedLeft) => void;
  }>({});

  const clearError = useCallback(() => setError(null), []);

  // Conectar Socket.IO
  const connect = useCallback(() => {
    if (!isAuthenticated || !user || socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    console.log('🔌 [useSocket] Iniciando conexión Socket.IO...');

    // Obtener URL del backend con fallback robusto
    const getBackendUrl = () => {
      const envUrl = import.meta.env.VITE_API_URL;
      if (envUrl) return envUrl.replace('/api', '');
      return import.meta.env.MODE === 'production'
        ? 'https://litam.onrender.com'
        : 'http://localhost:4000';
    };
    const backendUrl = getBackendUrl();
    const token = localStorage.getItem('access_token');

    // Configurar socket
    const socket = io(backendUrl, {
      auth: {
        token: token
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    socketRef.current = socket;

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('🔌 [useSocket] Conectado:', socket.id);
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);

      // Autenticar automáticamente
      if (user) {
        socket.emit('authenticate', {
          userId: user.id,
          role: user.role?.name || 'unknown',
          name: user.first_name + ' ' + user.last_name
        });
        console.log('🔐 [useSocket] Autenticación enviada para:', user.email);
      }
    });

    socket.on('disconnect', (reason: string) => {
      console.log('🔌 [useSocket] Desconectado:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // El servidor desconectó, reconectar manualmente
        socket.connect();
      }
    });

    socket.on('connect_error', (error: Error) => {
      console.error('🔌 [useSocket] Error de conexión:', error);
      setError('Error de conexión con el servidor');
      setIsConnecting(false);
    });

    socket.on('authenticated', (data: any) => {
      console.log('🔐 [useSocket] Autenticado exitosamente:', data);
    });

    // Eventos de mensajería
    socket.on('receiveMessage', (message: SocketMessage) => {
      console.log('💬 [useSocket] Mensaje recibido:', message);
      callbacksRef.current.onReceiveMessage?.(message);
    });

    socket.on('messageDelivered', (data: MessageDelivered) => {
      console.log('✅ [useSocket] Mensaje entregado:', data);
      callbacksRef.current.onMessageDelivered?.(data);
    });

    socket.on('messageError', (error: MessageError) => {
      console.error('❌ [useSocket] Error de mensaje:', error);
      callbacksRef.current.onMessageError?.(error);
    });

    socket.on('messagesRead', (data: MessagesRead) => {
      console.log('👁️ [useSocket] Mensajes leídos:', data);
      callbacksRef.current.onMessagesRead?.(data);
    });

    socket.on('userJoined', (data: UserJoinedLeft) => {
      console.log('👋 [useSocket] Usuario se unió:', data);
      callbacksRef.current.onUserJoined?.(data);
    });

    socket.on('userLeft', (data: UserJoinedLeft) => {
      console.log('👋 [useSocket] Usuario se fue:', data);
      callbacksRef.current.onUserLeft?.(data);
    });

    socket.on('error', (error: Error) => {
      console.error('❌ [useSocket] Error general:', error);
      setError(error.message || 'Error en Socket.IO');
    });

  }, [isAuthenticated, user]);

  // Desconectar
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 [useSocket] Desconectando...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  // Efecto para manejar conexión/desconexión automática
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  // Registrar callbacks
  const onReceiveMessage = useCallback((callback: (message: SocketMessage) => void) => {
    callbacksRef.current.onReceiveMessage = callback;
  }, []);

  const onMessageDelivered = useCallback((callback: (data: MessageDelivered) => void) => {
    callbacksRef.current.onMessageDelivered = callback;
  }, []);

  const onMessageError = useCallback((callback: (error: MessageError) => void) => {
    callbacksRef.current.onMessageError = callback;
  }, []);

  const onMessagesRead = useCallback((callback: (data: MessagesRead) => void) => {
    callbacksRef.current.onMessagesRead = callback;
  }, []);

  const onUserJoined = useCallback((callback: (data: UserJoinedLeft) => void) => {
    callbacksRef.current.onUserJoined = callback;
  }, []);

  const onUserLeft = useCallback((callback: (data: UserJoinedLeft) => void) => {
    callbacksRef.current.onUserLeft = callback;
  }, []);

  // Acciones de Socket.IO
  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      console.log('🚪 [useSocket] Uniéndose a conversación:', conversationId);
      socketRef.current.emit('joinConversation', conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current?.connected) {
      console.log('🚪 [useSocket] Saliendo de conversación:', conversationId);
      socketRef.current.emit('leaveConversation', conversationId);
    }
  }, []);

  const sendMessage = useCallback((data: {
    conversationId: string;
    content: string;
    messageType?: 'text' | 'image' | 'file';
    metadata?: any;
  }) => {
    if (!socketRef.current?.connected || !user) {
      console.error('❌ [useSocket] No se puede enviar mensaje: Socket no conectado o usuario no autenticado');
      return;
    }

    const messageData = {
      conversationId: data.conversationId,
      senderId: user.id,
      content: data.content,
      messageType: data.messageType || 'text',
      metadata: {
        ...data.metadata,
        temporaryId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    };

    console.log('📤 [useSocket] Enviando mensaje:', messageData);
    socketRef.current.emit('sendMessage', messageData);
  }, [user]);

  const markAsRead = useCallback((data: { conversationId: string; messageIds: string[] }) => {
    if (socketRef.current?.connected) {
      console.log('👁️ [useSocket] Marcando como leído:', data);
      socketRef.current.emit('markAsRead', data);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    onReceiveMessage,
    onMessageDelivered,
    onMessageError,
    onMessagesRead,
    onUserJoined,
    onUserLeft,
    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
    clearError
  };
}; 
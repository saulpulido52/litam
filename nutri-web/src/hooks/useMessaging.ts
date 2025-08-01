import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';
import messagingService, { type Conversation, type Message, type ConversationParticipant } from '../services/messagingService';

// Tipos específicos para el hook
interface FormattedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: 'nutritionist' | 'patient' | 'admin';
  content: string;
  timestamp: string;
  isRead: boolean;
  isDelivered?: boolean;
  temporaryId?: string; // Para mensajes enviados pero no confirmados
}

interface FormattedConversation {
  id: string;
  participant: ConversationParticipant;
  participantName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: FormattedMessage[];
}

export interface UseMessagingReturn {
  // Estados
  conversations: FormattedConversation[];
  selectedConversation: FormattedConversation | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  totalUnreadMessages: number;
  
  // Acciones de conversaciones
  loadConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  createConversation: (participantId: string) => Promise<string>; // Retorna ID de conversación
  
  // Acciones de mensajes
  sendMessage: (content: string) => Promise<void>;
  loadMessages: (conversationId: string, page?: number) => Promise<void>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  
  // Utilidades
  clearError: () => void;
  getParticipantName: (participant: ConversationParticipant) => string;
  formatMessageTime: (timestamp: string) => string;
}

export const useMessaging = (): UseMessagingReturn => {
  const { user } = useAuth();
  const socket = useSocket();
  
  // Estados principales
  const [conversations, setConversations] = useState<FormattedConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<FormattedConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Referencias para evitar problemas de dependencias
  const selectedConversationRef = useRef<FormattedConversation | null>(null);
  const conversationsRef = useRef<FormattedConversation[]>([]);
  
  // Sincronizar refs con estados
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);
  
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const clearError = useCallback(() => setError(null), []);

  // === UTILIDADES ===
  
  const getParticipantName = useCallback((participant: ConversationParticipant): string => {
    return messagingService.getParticipantName(participant);
  }, []);

  const formatMessageTime = useCallback((timestamp: string): string => {
    return messagingService.formatMessageTime(timestamp);
  }, []);

  // Convertir conversación del backend a formato del frontend
  const formatConversation = useCallback((conversation: Conversation): FormattedConversation => {
    if (!user) throw new Error('Usuario no autenticado');
    
    const participant = messagingService.getOtherParticipant(conversation, user.id);
    
    return {
      id: conversation.id,
      participant,
      participantName: getParticipantName(participant),
      lastMessage: '', // Se actualizará con el último mensaje
      lastMessageTime: conversation.last_message_at,
      unreadCount: 0, // Se calculará con los mensajes
              isOnline: messagingService.isParticipantOnline(),
      messages: []
    };
  }, [user, getParticipantName]);

  // Convertir mensaje del backend a formato del frontend
  const formatMessage = useCallback((message: Message): FormattedMessage => {
    if (!user) throw new Error('Usuario no autenticado');
    
    const senderType: 'nutritionist' | 'patient' | 'admin' = 
      message.sender.role.name === 'nutritionist' ? 'nutritionist' :
      message.sender.role.name === 'patient' ? 'patient' : 'admin';

    return {
      id: message.id,
      conversationId: message.conversation.id,
      senderId: message.sender.id,
      senderName: getParticipantName(message.sender),
      senderType,
      content: message.content,
      timestamp: message.timestamp,
      isRead: message.is_read,
      isDelivered: true
    };
  }, [user, getParticipantName]);

  // === CONVERSACIONES ===

  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 [useMessaging] Cargando conversaciones...');
      const backendConversations = await messagingService.getMyConversations();
      
      // Validar que backendConversations sea un array
      if (!Array.isArray(backendConversations)) {
        console.warn('⚠️ [useMessaging] backendConversations no es un array:', backendConversations);
        setConversations([]);
        return;
      }
      
      const formattedConversations = backendConversations.map(formatConversation);
      
      // Para cada conversación, obtener el último mensaje para el preview
      const conversationsWithLastMessage = await Promise.all(
        formattedConversations.map(async (conv) => {
          try {
            const { messages } = await messagingService.getConversationMessages(conv.id, 1, 1);
            if (messages.length > 0) {
              const lastMessage = messages[messages.length - 1];
              return {
                ...conv,
                lastMessage: lastMessage.content,
                lastMessageTime: lastMessage.timestamp,
                unreadCount: messages.filter(m => !m.is_read && m.sender.id !== user.id).length
              };
            }
            return conv;
          } catch (error) {
            console.warn(`⚠️ No se pudo cargar el último mensaje de conversación ${conv.id}`);
            return conv;
          }
        })
      );
      
      setConversations(conversationsWithLastMessage);
      console.log('✅ [useMessaging] Conversaciones cargadas:', conversationsWithLastMessage.length);
      
    } catch (error: any) {
      console.error('❌ [useMessaging] Error al cargar conversaciones:', error);
      setError(error.message || 'Error al cargar conversaciones');
    } finally {
      setLoading(false);
    }
  }, [user, formatConversation]);

  const createConversation = useCallback(async (participantId: string): Promise<string> => {
    if (!user) throw new Error('Usuario no autenticado');
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('➕ [useMessaging] Creando conversación con:', participantId);
      const conversation = await messagingService.createOrGetConversation(participantId);
      
      // Actualizar lista de conversaciones
      await loadConversations();
      
      return conversation.id;
    } catch (error: any) {
      console.error('❌ [useMessaging] Error al crear conversación:', error);
      setError(error.message || 'Error al crear conversación');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, loadConversations]);

  // === MENSAJES ===

  const loadMessages = useCallback(async (conversationId: string, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📄 [useMessaging] Cargando mensajes de conversación ${conversationId}`);
      const { messages } = await messagingService.getConversationMessages(conversationId, page, 50);
      
      const formattedMessages = messages.map(formatMessage);
      
      // Actualizar conversación seleccionada si coincide
      if (selectedConversationRef.current?.id === conversationId) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: page === 1 ? formattedMessages : [...prev.messages, ...formattedMessages]
        } : null);
      }
      
      // Actualizar lista de conversaciones
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              messages: page === 1 ? formattedMessages : [...conv.messages, ...formattedMessages]
            }
          : conv
      ));
      
      console.log(`✅ [useMessaging] ${formattedMessages.length} mensajes cargados`);
      
    } catch (error: any) {
      console.error('❌ [useMessaging] Error al cargar mensajes:', error);
      setError(error.message || 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  }, [formatMessage]);

  const selectConversation = useCallback(async (conversationId: string) => {
    const conversation = conversationsRef.current.find(conv => conv.id === conversationId);
    if (!conversation) {
      setError('Conversación no encontrada');
      return;
    }
    
    setSelectedConversation(conversation);
    
    // Unirse a la sala de Socket.IO
    socket.joinConversation(conversationId);
    
    // Cargar mensajes si no están cargados
    if (conversation.messages.length === 0) {
      await loadMessages(conversationId);
    }
    
    // Marcar mensajes como leídos
    await markMessagesAsRead(conversationId);
    
  }, [socket, loadMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!selectedConversationRef.current || !user) {
      setError('No hay conversación seleccionada');
      return;
    }
    
    const validation = messagingService.validateMessageContent(content);
    if (!validation.isValid) {
      setError(validation.error || 'Mensaje inválido');
      return;
    }
    
    const conversationId = selectedConversationRef.current.id;
    const temporaryId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Crear mensaje temporal para UI inmediata
    const temporaryMessage: FormattedMessage = {
      id: temporaryId,
      conversationId,
      senderId: user.id,
      senderName: `${user.first_name} ${user.last_name}`,
             senderType: user.role?.name === 'nutritionist' ? 'nutritionist' : 'patient',
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      isDelivered: false,
      temporaryId
    };
    
    // Actualizar UI inmediatamente
    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, temporaryMessage],
      lastMessage: content,
      lastMessageTime: temporaryMessage.timestamp
    } : null);
    
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            messages: [...conv.messages, temporaryMessage],
            lastMessage: content,
            lastMessageTime: temporaryMessage.timestamp
          }
        : conv
    ));
    
    try {
      // Enviar vía Socket.IO para tiempo real
      socket.sendMessage({
        conversationId,
        content,
        metadata: { temporaryId }
      });
      
      console.log('✅ [useMessaging] Mensaje enviado vía Socket.IO');
      
    } catch (error: any) {
      console.error('❌ [useMessaging] Error al enviar mensaje:', error);
      
      // Remover mensaje temporal en caso de error
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: prev.messages.filter(m => m.temporaryId !== temporaryId)
      } : null);
      
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              messages: conv.messages.filter(m => m.temporaryId !== temporaryId)
            }
          : conv
      ));
      
      setError(error.message || 'Error al enviar mensaje');
    }
  }, [user, socket]);

  const markMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!user) return;
    
    const conversation = conversationsRef.current.find(conv => conv.id === conversationId);
    if (!conversation) return;
    
    const unreadMessages = conversation.messages.filter(
      msg => !msg.isRead && msg.senderId !== user.id
    );
    
    if (unreadMessages.length === 0) return;
    
    try {
      // Marcar vía Socket.IO para tiempo real
      socket.markAsRead({
        conversationId,
        messageIds: unreadMessages.map(msg => msg.id)
      });
      
      // Actualizar localmente
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              unreadCount: 0,
              messages: conv.messages.map(msg => 
                unreadMessages.some(unread => unread.id === msg.id)
                  ? { ...msg, isRead: true }
                  : msg
              )
            }
          : conv
      ));
      
      if (selectedConversationRef.current?.id === conversationId) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          unreadCount: 0,
          messages: prev.messages.map(msg => 
            unreadMessages.some(unread => unread.id === msg.id)
              ? { ...msg, isRead: true }
              : msg
          )
        } : null);
      }
      
    } catch (error: any) {
      console.error('❌ [useMessaging] Error al marcar como leído:', error);
    }
  }, [user, socket]);

  // === EVENTOS SOCKET.IO ===

  useEffect(() => {
    if (!socket.isConnected) return;
    
    // Mensaje recibido en tiempo real
    socket.onReceiveMessage((message) => {
      console.log('💬 [useMessaging] Mensaje recibido en tiempo real:', message);
      
      const formattedMessage: FormattedMessage = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.senderName,
                 senderType: user?.role?.name === 'nutritionist' 
           ? (message.senderId === user.id ? 'nutritionist' : 'patient')
           : (message.senderId === user?.id ? 'patient' : 'nutritionist'),
        content: message.content,
        timestamp: message.timestamp,
        isRead: message.isRead,
        isDelivered: true
      };
      
      // Actualizar conversaciones
      setConversations(prev => prev.map(conv => 
        conv.id === message.conversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, formattedMessage],
              lastMessage: message.content,
              lastMessageTime: message.timestamp,
              unreadCount: message.senderId !== user?.id ? conv.unreadCount + 1 : conv.unreadCount
            }
          : conv
      ));
      
      // Actualizar conversación seleccionada
      if (selectedConversationRef.current?.id === message.conversationId) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, formattedMessage],
          lastMessage: message.content,
          lastMessageTime: message.timestamp
        } : null);
      }
    });
    
    // Mensaje entregado
    socket.onMessageDelivered((data) => {
      console.log('✅ [useMessaging] Mensaje entregado:', data);
      
      // Actualizar mensaje temporal con ID real
      const updateMessage = (messages: FormattedMessage[]) => 
        messages.map(msg => 
          msg.temporaryId === data.temporaryId 
            ? { ...msg, id: data.messageId, isDelivered: true, temporaryId: undefined }
            : msg
        );
      
      setConversations(prev => prev.map(conv => ({
        ...conv,
        messages: updateMessage(conv.messages)
      })));
      
      if (selectedConversationRef.current) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: updateMessage(prev.messages)
        } : null);
      }
    });
    
    // Error de mensaje
    socket.onMessageError((error) => {
      console.error('❌ [useMessaging] Error de mensaje:', error);
      setError(`Error al enviar mensaje: ${error.error}`);
    });
    
    // Mensajes marcados como leídos
    socket.onMessagesRead((data) => {
      console.log('👁️ [useMessaging] Mensajes marcados como leídos:', data);
      
      // Solo actualizar si no fui yo quien los marcó
      if (data.readBy !== user?.id) {
        const updateReadStatus = (messages: FormattedMessage[]) => 
          messages.map(msg => 
            data.messageIds.includes(msg.id) 
              ? { ...msg, isRead: true }
              : msg
          );
        
        setConversations(prev => prev.map(conv => ({
          ...conv,
          messages: updateReadStatus(conv.messages)
        })));
        
        if (selectedConversationRef.current) {
          setSelectedConversation(prev => prev ? {
            ...prev,
            messages: updateReadStatus(prev.messages)
          } : null);
        }
      }
    });
    
  }, [socket.isConnected, user?.id]);

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    if (user && socket.isConnected) {
      loadConversations();
    }
  }, [user, socket.isConnected, loadConversations]);

  // Calcular total de mensajes no leídos
  const totalUnreadMessages = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  return {
    conversations,
    selectedConversation,
    loading,
    error,
    isConnected: socket.isConnected,
    totalUnreadMessages,
    loadConversations,
    selectConversation,
    createConversation,
    sendMessage,
    loadMessages,
    markMessagesAsRead,
    clearError,
    getParticipantName,
    formatMessageTime
  };
}; 
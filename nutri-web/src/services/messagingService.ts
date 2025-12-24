import axios from 'axios';

// Configurar la instancia de axios
// Configurar la instancia de axios
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  return import.meta.env.MODE === 'production'
    ? 'https://litam.onrender.com/api'
    : 'http://localhost:4000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Tipos para las conversaciones y mensajes
export interface ConversationParticipant {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: {
    name: string;
  };
}

export interface Conversation {
  id: string;
  participant1: ConversationParticipant;
  participant2: ConversationParticipant;
  last_message_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation: {
    id: string;
  };
  sender: ConversationParticipant;
  content: string;
  is_read: boolean;
  timestamp: string;
  updated_at: string;
}

export interface CreateConversationDto {
  participantId: string;
}

export interface SendMessageDto {
  content: string;
}

export interface MarkMessageAsReadDto {
  messageId: string;
  isRead: boolean;
}

// Tipos para respuestas del API
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class MessagingService {
  // === CONVERSACIONES ===

  /**
   * Obtener todas las conversaciones del usuario autenticado
   */
  async getMyConversations(): Promise<Conversation[]> {
    try {
      console.log('🔍 [MessagingService] Obteniendo conversaciones...');
      const response = await api.get<ApiResponse<{ conversations: Conversation[] }>>('/messages/conversations');

      if (response.data.status === 'success') {
        // El backend devuelve data: { conversations }
        const conversations = response.data.data?.conversations || [];
        // Validar que sea un array
        if (Array.isArray(conversations)) {
          console.log('✅ [MessagingService] Conversaciones obtenidas:', conversations.length);
          return conversations;
        } else {
          console.warn('⚠️ [MessagingService] Los datos recibidos no son un array:', conversations);
          console.warn('⚠️ [MessagingService] Estructura completa de la respuesta:', response.data);
          return []; // Devolver array vacío si no es un array
        }
      } else {
        throw new Error(response.data.message || 'Error al obtener conversaciones');
      }
    } catch (error: any) {
      console.error('❌ [MessagingService] Error al obtener conversaciones:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener conversaciones');
    }
  }

  /**
   * Crear una nueva conversación o obtener una existente
   */
  async createOrGetConversation(participantId: string): Promise<Conversation> {
    try {
      console.log('🔍 [MessagingService] Creando/obteniendo conversación con:', participantId);
      const response = await api.post<ApiResponse<{ conversation: Conversation }>>('/messages/conversations', {
        participantId
      });

      if (response.data.status === 'success') {
        console.log('✅ [MessagingService] Conversación obtenida:', response.data.data.conversation.id);
        return response.data.data.conversation;
      } else {
        throw new Error(response.data.message || 'Error al crear/obtener conversación');
      }
    } catch (error: any) {
      console.error('❌ [MessagingService] Error al crear/obtener conversación:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al crear/obtener conversación');
    }
  }

  // === MENSAJES ===

  /**
   * Obtener mensajes de una conversación
   */
  async getConversationMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: Message[]; total: number; totalPages: number }> {
    try {
      console.log(`🔍 [MessagingService] Obteniendo mensajes de conversación ${conversationId} (página ${page})`);

      const response = await api.get<PaginatedResponse<Message>>(`/messages/conversations/${conversationId}/messages`, {
        params: { page, limit }
      });

      if (response.data.status === 'success') {
        const { items, total, totalPages } = response.data.data;
        console.log(`✅ [MessagingService] ${items.length} mensajes obtenidos de ${total} total`);
        return {
          messages: items,
          total,
          totalPages
        };
      } else {
        throw new Error(response.data.message || 'Error al obtener mensajes');
      }
    } catch (error: any) {
      console.error('❌ [MessagingService] Error al obtener mensajes:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al obtener mensajes');
    }
  }

  /**
   * Enviar un mensaje (vía REST para backup/historial)
   * Nota: Los mensajes en tiempo real se envían vía Socket.IO
   */
  async sendMessage(conversationId: string, content: string): Promise<Message> {
    try {
      console.log(`📤 [MessagingService] Enviando mensaje a conversación ${conversationId}`);

      const response = await api.post<ApiResponse<{ message: Message }>>(`/messages/conversations/${conversationId}/messages`, {
        content
      });

      if (response.data.status === 'success') {
        console.log('✅ [MessagingService] Mensaje enviado exitosamente');
        return response.data.data.message;
      } else {
        throw new Error(response.data.message || 'Error al enviar mensaje');
      }
    } catch (error: any) {
      console.error('❌ [MessagingService] Error al enviar mensaje:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al enviar mensaje');
    }
  }

  /**
   * Marcar un mensaje como leído
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      console.log(`👁️ [MessagingService] Marcando mensaje ${messageId} como leído`);

      const response = await api.patch<ApiResponse<void>>(`/messages/${messageId}/read`, {
        messageId,
        isRead: true
      });

      if (response.data.status === 'success') {
        console.log('✅ [MessagingService] Mensaje marcado como leído');
      } else {
        throw new Error(response.data.message || 'Error al marcar mensaje como leído');
      }
    } catch (error: any) {
      console.error('❌ [MessagingService] Error al marcar mensaje como leído:', error);
      throw new Error(error.response?.data?.message || error.message || 'Error al marcar mensaje como leído');
    }
  }

  // === UTILIDADES ===

  /**
   * Obtener el otro participante de una conversación
   */
  getOtherParticipant(conversation: Conversation, currentUserId: string): ConversationParticipant {
    if (conversation.participant1.id === currentUserId) {
      return conversation.participant2;
    } else {
      return conversation.participant1;
    }
  }

  /**
   * Formatear nombre completo de un participante
   */
  getParticipantName(participant: ConversationParticipant): string {
    return `${participant.first_name} ${participant.last_name}`.trim();
  }

  /**
   * Determinar si el usuario está en línea (placeholder para futuras implementaciones)
   */
  isParticipantOnline(): boolean {
    // TODO: Implementar lógica de presencia en tiempo real
    return false;
  }

  /**
   * Formatear tiempo relativo para mensajes
   */
  formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      if (diffInMinutes < 1) {
        return 'Ahora';
      }
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  }

  /**
   * Validar contenido de mensaje antes de enviar
   */
  validateMessageContent(content: string): { isValid: boolean; error?: string } {
    if (!content || content.trim().length === 0) {
      return { isValid: false, error: 'El mensaje no puede estar vacío' };
    }

    if (content.length > 1000) {
      return { isValid: false, error: 'El mensaje no puede exceder 1000 caracteres' };
    }

    return { isValid: true };
  }
}

// Crear instancia única del servicio
const messagingService = new MessagingService();

export default messagingService; 
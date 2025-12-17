import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, User, Check, CheckCheck } from 'lucide-react';

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_type: 'nutritionist' | 'patient';
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
}

interface Conversation {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  online: boolean;
  messages: Message[];
}

const MessagingPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: 1,
        patient_id: 1,
        patient_name: 'María González',
        last_message: 'Gracias por el plan, me está funcionando muy bien',
        last_message_time: '2024-12-16T10:30:00',
        unread_count: 2,
        online: true,
        messages: [
          {
            id: 1,
            sender_id: 1,
            sender_name: 'María González',
            sender_type: 'patient',
            content: 'Hola doctora, tengo una duda sobre la dieta',
            timestamp: '2024-12-16T09:00:00',
            read: true
          },
          {
            id: 2,
            sender_id: 2,
            sender_name: 'Dr. Nutrióloga',
            sender_type: 'nutritionist',
            content: 'Hola María, claro, dime cuál es tu duda',
            timestamp: '2024-12-16T09:15:00',
            read: true
          },
          {
            id: 3,
            sender_id: 1,
            sender_name: 'María González',
            sender_type: 'patient',
            content: '¿Puedo sustituir la quinoa por arroz integral?',
            timestamp: '2024-12-16T09:30:00',
            read: true
          },
          {
            id: 4,
            sender_id: 2,
            sender_name: 'Dr. Nutrióloga',
            sender_type: 'nutritionist',
            content: 'Sí, perfectamente. El arroz integral es una excelente alternativa. Asegúrate de mantener las porciones que indiqué.',
            timestamp: '2024-12-16T09:45:00',
            read: true
          },
          {
            id: 5,
            sender_id: 1,
            sender_name: 'María González',
            sender_type: 'patient',
            content: 'Perfecto, muchas gracias',
            timestamp: '2024-12-16T10:00:00',
            read: false
          },
          {
            id: 6,
            sender_id: 1,
            sender_name: 'María González',
            sender_type: 'patient',
            content: 'Gracias por el plan, me está funcionando muy bien',
            timestamp: '2024-12-16T10:30:00',
            read: false
          }
        ]
      },
      {
        id: 2,
        patient_id: 2,
        patient_name: 'Carlos Ruiz',
        last_message: 'Mi peso ha bajado 2kg esta semana',
        last_message_time: '2024-12-15T18:45:00',
        unread_count: 0,
        online: false,
        messages: [
          {
            id: 7,
            sender_id: 2,
            sender_name: 'Carlos Ruiz',
            sender_type: 'patient',
            content: 'Mi peso ha bajado 2kg esta semana',
            timestamp: '2024-12-15T18:45:00',
            read: true
          }
        ]
      },
      {
        id: 3,
        patient_id: 3,
        patient_name: 'Ana López',
        last_message: '¿Podemos reagendar la cita de mañana?',
        last_message_time: '2024-12-14T14:20:00',
        unread_count: 1,
        online: false,
        messages: [
          {
            id: 8,
            sender_id: 3,
            sender_name: 'Ana López',
            sender_type: 'patient',
            content: '¿Podemos reagendar la cita de mañana?',
            timestamp: '2024-12-14T14:20:00',
            read: false
          }
        ]
      }
    ];

    setConversations(mockConversations);
    setSelectedConversation(mockConversations[0]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now(),
      sender_id: 2, // Nutrióloga
      sender_name: 'Dr. Nutrióloga',
      sender_type: 'nutritionist',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true
    };

    // Actualizar conversación seleccionada
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      last_message: newMessage,
      last_message_time: new Date().toISOString()
    };

    setSelectedConversation(updatedConversation);

    // Actualizar en la lista de conversaciones
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id ? updatedConversation : conv
    ));

    setNewMessage('');
  };

  const markAsRead = (conversationId: number) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unread_count: 0,
          messages: conv.messages.map(msg => ({ ...msg, read: true }))
        };
      }
      return conv;
    }));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  const totalUnreadMessages = conversations.reduce((total, conv) => total + conv.unread_count, 0);

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2 mb-1">Mensajería</h1>
          <p className="text-muted">Comunícate directamente con tus pacientes</p>
        </div>
        <div className="col-md-4 text-end">
          <div className="d-flex align-items-center justify-content-end">
            <span className="badge bg-primary me-2">{totalUnreadMessages} mensajes sin leer</span>
            <button className="btn btn-outline-primary">
              <MessageCircle size={18} className="me-2" />
              Nueva conversación
            </button>
          </div>
        </div>
      </div>

      <div className="row" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Conversations List */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <div className="input-group">
                <span className="input-group-text">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar conversaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush" style={{ height: '100%', overflowY: 'auto' }}>
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`list-group-item list-group-item-action ${
                      selectedConversation?.id === conversation.id ? 'active' : ''
                    }`}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      markAsRead(conversation.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-start">
                      <div className="position-relative me-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                          <User size={20} className="text-primary" />
                        </div>
                        {conversation.online && (
                          <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white" 
                                style={{ width: '12px', height: '12px' }}></span>
                        )}
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-1 text-truncate">{conversation.patient_name}</h6>
                          <small className="text-muted">{formatTime(conversation.last_message_time)}</small>
                        </div>
                        <p className="mb-1 text-muted small text-truncate">{conversation.last_message}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {conversation.online ? 'En línea' : 'Desconectado'}
                          </small>
                          {conversation.unread_count > 0 && (
                            <span className="badge bg-primary">{conversation.unread_count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-md-8">
          {selectedConversation ? (
            <div className="card border-0 shadow-sm h-100 d-flex flex-column">
              {/* Chat Header */}
              <div className="card-header bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="position-relative me-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                        <User size={24} className="text-primary" />
                      </div>
                      {selectedConversation.online && (
                        <span className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white" 
                              style={{ width: '12px', height: '12px' }}></span>
                      )}
                    </div>
                    <div>
                      <h6 className="mb-0">{selectedConversation.patient_name}</h6>
                      <small className="text-muted">
                        {selectedConversation.online ? 'En línea' : 'Desconectado'}
                      </small>
                    </div>
                  </div>
                  <div className="btn-group">
                    <button className="btn btn-outline-primary btn-sm">
                      <Phone size={16} />
                    </button>
                    <button className="btn btn-outline-primary btn-sm">
                      <Video size={16} />
                    </button>
                    <button className="btn btn-outline-secondary btn-sm">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="card-body flex-grow-1" style={{ overflowY: 'auto', maxHeight: '400px' }}>
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`d-flex mb-3 ${
                      message.sender_type === 'nutritionist' ? 'justify-content-end' : 'justify-content-start'
                    }`}
                  >
                    <div
                      className={`max-width-75 ${
                        message.sender_type === 'nutritionist'
                          ? 'bg-primary text-white'
                          : 'bg-light text-dark'
                      } rounded-3 p-3`}
                      style={{ maxWidth: '75%' }}
                    >
                      <p className="mb-1">{message.content}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className={message.sender_type === 'nutritionist' ? 'text-white-50' : 'text-muted'}>
                          {formatTime(message.timestamp)}
                        </small>
                        {message.sender_type === 'nutritionist' && (
                          <span className="ms-2">
                            {message.read ? (
                              <CheckCheck size={14} className="text-white-50" />
                            ) : (
                              <Check size={14} className="text-white-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="card-footer bg-white">
                <div className="input-group">
                  <button className="btn btn-outline-secondary">
                    <Paperclip size={18} />
                  </button>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Escribe tu mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="btn btn-outline-secondary">
                    <Smile size={18} />
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm h-100 d-flex align-items-center justify-content-center">
              <div className="text-center">
                <MessageCircle size={64} className="text-muted mb-3" />
                <h5 className="text-muted">Selecciona una conversación</h5>
                <p className="text-muted">Elige una conversación de la lista para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage; 
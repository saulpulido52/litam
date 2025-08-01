import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, Check, CheckCheck, Wifi, WifiOff, Loader, User, AlertCircle } from 'lucide-react';
import { useMessaging } from '../hooks/useMessaging';
import { useAuth } from '../hooks/useAuth';

const MessagingPage: React.FC = () => {
  const { user } = useAuth();
  const {
    conversations,
    selectedConversation,
    loading,
    error,
    isConnected,
    totalUnreadMessages,
    selectConversation,
    sendMessage,
    clearError,
    formatMessageTime
  } = useMessaging();

  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando lleguen nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtrar conversaciones por término de búsqueda
  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar envío de mensaje
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Manejar Enter para enviar mensaje
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Seleccionar conversación
  const handleSelectConversation = async (conversationId: string) => {
    try {
      await selectConversation(conversationId);
    } catch (error) {
      console.error('Error al seleccionar conversación:', error);
    }
  };

  const isNutritionist = user?.role?.name === 'nutritionist';

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="h2 mb-1">
            Mensajería
            {!isConnected && (
              <span className="ms-2" title="Desconectado">
                <WifiOff size={20} className="text-danger" />
              </span>
            )}
            {isConnected && (
              <span className="ms-2" title="Conectado">
                <Wifi size={20} className="text-success" />
              </span>
            )}
          </h1>
          <p className="text-muted">
            {isNutritionist 
              ? 'Comunícate directamente con tus pacientes' 
              : 'Comunícate con tu nutriólogo'
            }
          </p>
        </div>
        <div className="col-md-4 text-end">
          <div className="d-flex align-items-center justify-content-end">
            <span className="badge bg-primary me-2">
              {totalUnreadMessages} mensajes sin leer
            </span>
            <button className="btn btn-outline-primary" disabled={!isConnected}>
              <MessageCircle size={18} className="me-2" />
              Nueva conversación
            </button>
          </div>
        </div>
      </div>

      {/* Mostrar errores */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <AlertCircle size={16} className="me-2" />
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={clearError}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className="row">
        {/* Lista de Conversaciones */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Conversaciones</h6>
                {loading && <Loader size={16} className="text-primary animate-spin" />}
              </div>
              
              {/* Buscador */}
              <div className="input-group mt-3">
                <span className="input-group-text bg-transparent border-end-0">
                  <Search size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Buscar conversaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="card-body p-0" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {loading && conversations.length === 0 ? (
                <div className="text-center py-4">
                  <Loader size={32} className="text-primary animate-spin mb-2" />
                  <p className="text-muted">Cargando conversaciones...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-4">
                  <MessageCircle size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">
                    {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones'}
                  </h6>
                  <p className="text-muted small">
                    {isNutritionist 
                      ? 'Las conversaciones aparecerán cuando los pacientes te escriban'
                      : 'Inicia una conversación con tu nutriólogo'
                    }
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`border-bottom p-3 cursor-pointer conversation-item ${
                      selectedConversation?.id === conversation.id ? 'bg-primary bg-opacity-10' : ''
                    }`}
                    onClick={() => handleSelectConversation(conversation.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex">
                      <div className="position-relative me-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                          <User size={20} className="text-primary" />
                        </div>
                        {conversation.isOnline && (
                          <span 
                            className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white" 
                            style={{ width: '10px', height: '10px' }}
                          ></span>
                        )}
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="mb-1 text-truncate">{conversation.participantName}</h6>
                          <small className="text-muted">
                            {formatMessageTime(conversation.lastMessageTime)}
                          </small>
                        </div>
                        <p className="mb-1 text-muted text-truncate small">
                          {conversation.lastMessage || 'No hay mensajes'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="badge bg-primary rounded-pill">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Área de Chat */}
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
                      {selectedConversation.isOnline && (
                        <span 
                          className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white" 
                          style={{ width: '12px', height: '12px' }}
                        ></span>
                      )}
                    </div>
                    <div>
                      <h6 className="mb-0">{selectedConversation.participantName}</h6>
                      <small className="text-muted">
                        {selectedConversation.isOnline ? 'En línea' : 'Desconectado'}
                      </small>
                    </div>
                  </div>
                  <div className="btn-group">
                    <button className="btn btn-outline-primary btn-sm" disabled>
                      <Phone size={16} />
                    </button>
                    <button className="btn btn-outline-primary btn-sm" disabled>
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
                {selectedConversation.messages.length === 0 ? (
                  <div className="text-center py-4">
                    <MessageCircle size={48} className="text-muted mb-3" />
                    <h6 className="text-muted">No hay mensajes</h6>
                    <p className="text-muted">Inicia la conversación enviando un mensaje</p>
                  </div>
                ) : (
                  selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`d-flex mb-3 ${
                        message.senderId === user?.id ? 'justify-content-end' : 'justify-content-start'
                      }`}
                    >
                      <div
                        className={`max-width-75 ${
                          message.senderId === user?.id
                            ? 'bg-primary text-white'
                            : 'bg-light text-dark'
                        } rounded-3 p-3`}
                        style={{ maxWidth: '75%' }}
                      >
                        <p className="mb-1">{message.content}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className={message.senderId === user?.id ? 'text-white-50' : 'text-muted'}>
                            {formatMessageTime(message.timestamp)}
                          </small>
                          {message.senderId === user?.id && (
                            <span className="ms-2">
                              {message.isDelivered === false ? (
                                <Loader size={12} className="animate-spin text-white-50" />
                              ) : message.isRead ? (
                                <CheckCheck size={14} className="text-white-50" />
                              ) : (
                                <Check size={14} className="text-white-50" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="card-footer bg-white">
                <div className="input-group">
                  <button className="btn btn-outline-secondary" disabled>
                    <Paperclip size={18} />
                  </button>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Escribe tu mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!isConnected || isSending}
                    maxLength={1000}
                  />
                  <button className="btn btn-outline-secondary" disabled>
                    <Smile size={18} />
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !isConnected || isSending}
                  >
                    {isSending ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
                <small className="text-muted">
                  {!isConnected && 'Desconectado - Los mensajes se enviarán cuando se restablezca la conexión'}
                  {newMessage.length > 0 && ` • ${newMessage.length}/1000 caracteres`}
                </small>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm h-100 d-flex align-items-center justify-content-center">
              <div className="text-center">
                <MessageCircle size={64} className="text-muted mb-3" />
                <h5 className="text-muted">Selecciona una conversación</h5>
                <p className="text-muted">
                  {conversations.length === 0 
                    ? 'No tienes conversaciones activas'
                    : 'Elige una conversación de la lista para comenzar a chatear'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage; 
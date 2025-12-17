// src/modules/messaging/message.routes.ts
import { Router } from 'express';
import messageController from '../../modules/messaging/message.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { validateMiddleware } from '../../middleware/validation.middleware';
import {
    CreateConversationDto,
    SendMessageDto,
    MarkMessageAsReadDto,
} from '../../modules/messaging/message.dto';
import { RoleName } from '../../database/entities/role.entity';

const router = Router();

// Todas las rutas de mensajería requieren autenticación
router.use(protect);

// --- Rutas de Conversaciones ---
router.route('/conversations')
    .post(
        validateMiddleware(CreateConversationDto),
        messageController.createOrGetConversation // Permite crear una nueva o recuperar una existente
    )
    .get(messageController.getMyConversations); // Obtener todas las conversaciones del usuario

// --- Rutas de Mensajes dentro de una Conversación ---
router.route('/conversations/:conversationId/messages')
    .get(messageController.getConversationMessages) // Obtener historial de mensajes
    .post(validateMiddleware(SendMessageDto), messageController.sendMessage); // Enviar mensaje (REST)

// Marcar un mensaje como leído
router.patch('/messages/:messageId/read', validateMiddleware(MarkMessageAsReadDto), messageController.markMessageAsRead);


export default router;
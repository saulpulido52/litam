// src/modules/messaging/message.controller.ts
import { Request, Response, NextFunction } from 'express';
import messageService from '../../modules/messaging/message.service';
import { AppError } from '../../utils/app.error';
import {
    CreateConversationDto,
    SendMessageDto,
    MarkMessageAsReadDto,
} from '../../modules/messaging/message.dto';
import { RoleName } from '../../database/entities/role.entity';

class MessageController {
    // --- Rutas de Conversaciones ---
    public async createOrGetConversation(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }
            const conversation = await messageService.createOrGetConversation(req.user.id, req.body as CreateConversationDto);
            res.status(200).json({ // 200 OK porque puede ser una conversación existente
                status: 'success',
                message: 'Conversación creada o recuperada exitosamente.',
                data: { conversation },
            });
        } catch (error: any) {
            console.error('Error en MessageController.createOrGetConversation:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al crear o recuperar la conversación.', 500));
        }
    }

    public async getMyConversations(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }
            const conversations = await messageService.getUserConversations(req.user.id);
            res.status(200).json({
                status: 'success',
                results: conversations.length,
                data: { conversations },
            });
        } catch (error: any) {
            console.error('Error en MessageController.getMyConversations:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener mis conversaciones.', 500));
        }
    }

    // --- Rutas de Mensajes ---

    public async getConversationMessages(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }
            const { conversationId } = req.params;
            const page = parseInt(req.query.page as string || '1', 10);
            const limit = parseInt(req.query.limit as string || '50', 10);

            const result = await messageService.getConversationMessages(conversationId, req.user.id, page, limit);
            res.status(200).json({
                status: 'success',
                ...result, // messages, total, page, limit, totalPages
            });
        } catch (error: any) {
            console.error('Error en MessageController.getConversationMessages:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al obtener los mensajes de la conversación.', 500));
        }
    }

    public async sendMessage(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }
            const { conversationId } = req.params;
            const { content } = req.body as SendMessageDto;

            // Este endpoint es principalmente para el historial vía REST,
            // pero el envío en tiempo real se haría por Socket.IO.
            // Aquí, guardamos en la BD y respondemos.
            const message = await messageService.saveMessage(conversationId, req.user.id, content);
            res.status(201).json({
                status: 'success',
                message: 'Mensaje enviado y guardado.',
                data: { message },
            });
        } catch (error: any) {
            console.error('Error en MessageController.sendMessage:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al enviar el mensaje.', 500));
        }
    }

    public async markMessageAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return next(new AppError('Usuario no autenticado.', 401));
            }
            const { messageId } = req.params;
            const updatedMessage = await messageService.markMessageAsRead(messageId, req.user.id);
            res.status(200).json({
                status: 'success',
                message: 'Mensaje marcado como leído.',
                data: { message: updatedMessage },
            });
        } catch (error: any) {
            console.error('Error en MessageController.markMessageAsRead:', error);
            if (error instanceof AppError) {
                return next(error);
            }
            next(new AppError('Error al marcar mensaje como leído.', 500));
        }
    }
}

export default new MessageController();
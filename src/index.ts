// src/index.ts
import app from './app';
import { AppDataSource } from './database/data-source';
import { Role, RoleName } from './database/entities/role.entity';
import { User } from './database/entities/user.entity';
import { NutritionistProfile } from './database/entities/nutritionist_profile.entity';
import monetizationService from './modules/monetization/monetization.service';
import bcrypt from 'bcrypt';
import http from 'http'; // Importar módulo http de Node.js
import { Server as SocketIOServer } from 'socket.io'; // Importar Server de socket.io

const PORT = Number(process.env.PORT) || 4000;

// Crear el servidor HTTP para Express y Socket.IO
const server = http.createServer(app);

// *** CONFIGURACIÓN OPTIMIZADA DE SOCKET.IO PARA MÚLTIPLES USUARIOS ***
const io = new SocketIOServer(server, {
    cors: {
        origin: function(origin, callback) {
            // Permitir requests sin origin (mobile apps)
            if (!origin) return callback(null, true);
            
            const allowedOrigins = [
                'http://localhost:5000',
                'http://localhost:3000',
                'http://127.0.0.1:5000',
                'http://127.0.0.1:3000',
                // Añadir dominios de producción aquí
            ];
            
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('No permitido por CORS'));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
    },
    // Configuraciones para múltiples usuarios concurrentes
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,      // 60 segundos timeout para ping
    pingInterval: 25000,     // 25 segundos intervalo de ping
    maxHttpBufferSize: 1e6,  // 1MB máximo buffer size
    allowEIO3: true,         // Soporte para Engine.IO v3 (retrocompatibilidad)
    
    // Configuración para manejar alta concurrencia
    connectTimeout: 45000,   // 45 segundos timeout para conexión
    serveClient: false,      // No servir cliente Socket.IO (mejora rendimiento)
});

// Middleware de autenticación para Socket.IO (opcional pero recomendado)
io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    
    // Aquí puedes verificar el token JWT si es necesario
    // Por ahora, permitimos todas las conexiones para desarrollo
    console.log(`[Socket.IO] Middleware - Conexión desde: ${socket.handshake.address}`);
    
    // Almacenar información del usuario en el socket si está autenticado
    if (token) {
        // TODO: Verificar JWT y extraer información del usuario
        socket.data.userId = 'user_id_from_token'; // Placeholder
        socket.data.userRole = 'nutritionist'; // Placeholder
    }
    
    next();
});

// *** MANEJO DE EVENTOS SOCKET.IO OPTIMIZADO PARA MÚLTIPLES USUARIOS ***
io.on('connection', (socket) => {
    console.log(`[Socket.IO] Usuario conectado: ${socket.id} desde ${socket.handshake.address}`);
    
    // Estadísticas de conexiones activas
    const connectedUsers = io.engine.clientsCount;
    console.log(`[Socket.IO] Usuarios conectados actualmente: ${connectedUsers}`);

    // Evento para cuando un usuario se identifica (después del login)
    socket.on('authenticate', (userData: { userId: string; role: string; name: string }) => {
        socket.data.userId = userData.userId;
        socket.data.userRole = userData.role;
        socket.data.userName = userData.name;
        
        console.log(`[Socket.IO] Usuario autenticado: ${userData.name} (${userData.role}) - Socket: ${socket.id}`);
        
        // Unir a sala específica del rol para notificaciones masivas
        socket.join(`role_${userData.role}`);
        
        // Notificar al usuario que está conectado
        socket.emit('authenticated', {
            message: 'Conectado exitosamente',
            timestamp: new Date().toISOString()
        });
    });

    // Evento para unirse a una conversación/sala específica
    socket.on('joinConversation', (conversationId: string) => {
        if (!conversationId) {
            socket.emit('error', { message: 'ID de conversación requerido' });
            return;
        }
        
        socket.join(conversationId);
        console.log(`[Socket.IO] Usuario ${socket.data.userName || socket.id} unido a conversación: ${conversationId}`);
        
        // Notificar a otros usuarios en la conversación
        socket.to(conversationId).emit('userJoined', {
            userId: socket.data.userId,
            userName: socket.data.userName,
            timestamp: new Date().toISOString()
        });
    });

    // Evento para salir de una conversación
    socket.on('leaveConversation', (conversationId: string) => {
        socket.leave(conversationId);
        console.log(`[Socket.IO] Usuario ${socket.data.userName || socket.id} salió de conversación: ${conversationId}`);
        
        // Notificar a otros usuarios en la conversación
        socket.to(conversationId).emit('userLeft', {
            userId: socket.data.userId,
            userName: socket.data.userName,
            timestamp: new Date().toISOString()
        });
    });

    // Evento para enviar mensajes con validación mejorada
    socket.on('sendMessage', async (data: { 
        conversationId: string; 
        senderId: string; 
        content: string;
        messageType?: 'text' | 'image' | 'file';
        metadata?: any;
    }) => {
        try {
            // Validaciones básicas
            if (!data.conversationId || !data.senderId || !data.content) {
                socket.emit('messageError', { 
                    error: 'Datos de mensaje incompletos',
                    code: 'INVALID_MESSAGE_DATA'
                });
                return;
            }

            // Verificar que el usuario esté en la conversación
            const userRooms = Array.from(socket.rooms);
            if (!userRooms.includes(data.conversationId)) {
                socket.emit('messageError', { 
                    error: 'No tienes acceso a esta conversación',
                    code: 'UNAUTHORIZED_CONVERSATION'
                });
                return;
            }

            console.log(`[Socket.IO] Mensaje recibido en ${data.conversationId} de ${socket.data.userName || data.senderId}`);

            // TODO: Aquí llamar al servicio para guardar el mensaje en la BD
            // await messageService.saveMessage(data);

            // Crear objeto de mensaje completo
            const message = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // ID temporal
                conversationId: data.conversationId,
                senderId: data.senderId,
                senderName: socket.data.userName || 'Usuario',
                content: data.content,
                messageType: data.messageType || 'text',
                metadata: data.metadata || {},
                timestamp: new Date().toISOString(),
                isRead: false
            };

            // Emitir el mensaje a todos los usuarios en la conversación
            io.to(data.conversationId).emit('receiveMessage', message);
            
            // Confirma al remitente que el mensaje fue enviado
            socket.emit('messageDelivered', {
                temporaryId: data.metadata?.temporaryId,
                messageId: message.id,
                timestamp: message.timestamp
            });

            console.log(`[Socket.IO] Mensaje emitido a conversación ${data.conversationId}`);

        } catch (error) {
            console.error(`[Socket.IO ERROR] Error al procesar mensaje:`, error);
            socket.emit('messageError', { 
                error: 'Error interno del servidor',
                code: 'SERVER_ERROR'
            });
        }
    });

    // Evento para marcar mensajes como leídos
    socket.on('markAsRead', (data: { conversationId: string; messageIds: string[] }) => {
        if (!data.conversationId || !data.messageIds?.length) return;

        // TODO: Llamar al servicio para marcar como leído en la BD
        // await messageService.markAsRead(data.messageIds, socket.data.userId);

        // Notificar a otros usuarios en la conversación
        socket.to(data.conversationId).emit('messagesRead', {
            readBy: socket.data.userId,
            messageIds: data.messageIds,
            timestamp: new Date().toISOString()
        });
    });

    // Evento para notificaciones push a grupos específicos
    socket.on('notifyRole', (data: { role: string; message: string; type: string }) => {
        if (socket.data.userRole !== 'admin') {
            socket.emit('error', { message: 'No autorizado para enviar notificaciones masivas' });
            return;
        }

        io.to(`role_${data.role}`).emit('notification', {
            type: data.type,
            message: data.message,
            timestamp: new Date().toISOString(),
            from: socket.data.userName
        });

        console.log(`[Socket.IO] Notificación enviada a rol ${data.role}: ${data.message}`);
    });

    // Manejo de desconexión
    socket.on('disconnect', (reason) => {
        const connectedUsers = io.engine.clientsCount;
        console.log(`[Socket.IO] Usuario desconectado: ${socket.data.userName || socket.id} - Razón: ${reason}`);
        console.log(`[Socket.IO] Usuarios conectados ahora: ${connectedUsers}`);
    });

    // Manejo de errores del socket
    socket.on('error', (error) => {
        console.error(`[Socket.IO ERROR] Error en socket ${socket.id}:`, error);
    });
});

// *** FUNCIONES DE UTILIDAD PARA MÚLTIPLES USUARIOS ***

// Función para obtener estadísticas de conexiones
export const getConnectionStats = () => {
    return {
        totalConnections: io.engine.clientsCount,
        timestamp: new Date().toISOString()
    };
};

// Función para enviar notificación a usuario específico
export const notifyUser = (userId: string, notification: any) => {
    const sockets = io.sockets.sockets;
    for (const [socketId, socket] of sockets) {
        if (socket.data.userId === userId) {
            socket.emit('notification', notification);
            return true;
        }
    }
    return false;
};

// *** INICIALIZACIÓN DE LA BASE DE DATOS ***
async function initializeDatabase() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('Data Source has been initialized!');
        }

        const roleRepository = AppDataSource.getRepository(Role);
        const userRepository = AppDataSource.getRepository(User);
        const nutritionistProfileRepository = AppDataSource.getRepository(NutritionistProfile);

        // 1. Crear roles básicos
        const rolesToSeed: RoleName[] = [RoleName.PATIENT, RoleName.NUTRITIONIST, RoleName.ADMIN];

        for (const roleName of rolesToSeed) {
            let role = await roleRepository.findOneBy({ name: roleName });
            if (!role) {
                role = roleRepository.create({ name: roleName });
                await roleRepository.save(role);
                console.log(`Rol creado: ${roleName}`);
            }
        }

        // 2. Crear nutriólogo por defecto
        const nutritionistRole = await roleRepository.findOneBy({ name: RoleName.NUTRITIONIST });
        if (!nutritionistRole) {
            throw new Error('No se pudo encontrar el rol de nutricionista');
        }

        const defaultNutritionistEmail = 'nutri.admin@sistema.com';
        let defaultNutritionist = await userRepository.findOne({ 
            where: { email: defaultNutritionistEmail },
            relations: ['role']
        });

        if (!defaultNutritionist) {
            // Crear nutriólogo por defecto
            const hashedPassword = await bcrypt.hash('nutri123', 12);
            
            defaultNutritionist = userRepository.create({
                email: defaultNutritionistEmail,
                password_hash: hashedPassword,
                first_name: 'Dr. Sistema',
                last_name: 'Nutricional',
                age: 35,
                gender: 'other',
                role: nutritionistRole,
                is_active: true
            });
            await userRepository.save(defaultNutritionist);

            // Crear perfil completo del nutriólogo
            const nutritionistProfile = nutritionistProfileRepository.create({
                user: defaultNutritionist,
                license_number: 'SYS-00001',
                specialties: ['Nutrición Clínica', 'Nutrición General', 'Control de Peso'],
                years_of_experience: 10,
                education: ['Sistema de Nutrición - Administrador por Defecto'],
                certifications: ['Certificación Administrador Sistema'],
                languages: ['Español'],
                consultation_fee: 0,
                bio: 'Nutriólogo administrador por defecto del sistema. Puedes cambiar estos datos desde tu perfil.',
                is_verified: true
            });
            await nutritionistProfileRepository.save(nutritionistProfile);

            console.log('🥗 Nutriólogo por defecto creado:');
            console.log(`   📧 Email: ${defaultNutritionistEmail}`);
            console.log(`   🔑 Contraseña: nutri123`);
            console.log(`   👤 Nombre: Dr. Sistema Nutricional`);
            console.log(`   ⚠️  ¡CAMBIA LA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN!`);
        } else {
            console.log('ℹ️  Nutriólogo por defecto ya existe');
        }

        // 3. Inicializar tiers de monetización por defecto
        await monetizationService.initializeDefaultTiers();
        console.log('💰 Tiers de monetización inicializados');

        console.log('Base de datos inicializada, roles verificados, nutriólogo por defecto y tiers de monetización listos');
    } catch (err) {
        console.error('Error during Data Source initialization or seeding:', err);
        process.exit(1);
    }
}

// *** INICIO DEL SERVIDOR ***
async function startServer() {
    await initializeDatabase();

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📡 API available at http://0.0.0.0:${PORT}/api`);
        console.log(`🔌 Socket.IO available on ws://0.0.0.0:${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`💾 Database: ${process.env.DB_DATABASE || 'default'}`);
        console.log(`👥 Ready for multiple concurrent users`);
    });
}

// Manejo de cierre graceful del servidor
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

startServer();
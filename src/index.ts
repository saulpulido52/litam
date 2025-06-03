// src/index.ts
import app from '@/app';
import { AppDataSource } from '@/database/data-source';
import { Role, RoleName } from '@/database/entities/role.entity';
import http from 'http'; // Importar módulo http de Node.js
import { Server as SocketIOServer } from 'socket.io'; // Importar Server de socket.io

const PORT = process.env.PORT || 3001;

// Crear el servidor HTTP para Express y Socket.IO
const server = http.createServer(app);

// Configurar Socket.IO para escuchar en el mismo servidor HTTP
// Opcional: configurar CORS para Socket.IO
const io = new SocketIOServer(server, {
    cors: {
        origin: "*", // Permitir todas las conexiones CORS para desarrollo. En producción, especificar dominios.
        methods: ["GET", "POST"]
    }
});

// *** Lógica de Socket.IO (lo moveremos a un handler después) ***
io.on('connection', (socket) => {
    console.log(`[Socket.IO] Usuario conectado: ${socket.id}`);

    // Evento para cuando un usuario se une a una conversación/sala
    socket.on('joinConversation', (conversationId: string) => {
        socket.join(conversationId);
        console.log(`[Socket.IO] Usuario ${socket.id} unido a la sala: ${conversationId}`);
    });

    // Evento para cuando un usuario envía un mensaje
    socket.on('sendMessage', async (data: { conversationId: string; senderId: string; content: string }) => {
        console.log(`[Socket.IO] Mensaje recibido en ${data.conversationId} de ${data.senderId}: ${data.content}`);
        // Aquí llamaríamos a un servicio para guardar el mensaje en la BD
        // y luego emitiríamos el mensaje a la sala
        try {
            // Esto es un placeholder; la lógica real de guardado estará en el servicio
            // await messageService.saveMessage(data.conversationId, data.senderId, data.content);

            // Emitir el mensaje a todos los usuarios en la sala de la conversación
            io.to(data.conversationId).emit('receiveMessage', {
                conversationId: data.conversationId,
                senderId: data.senderId,
                content: data.content,
                timestamp: new Date().toISOString(),
                isRead: false
            });
            console.log(`[Socket.IO] Mensaje emitido a sala ${data.conversationId}`);
        } catch (error) {
            console.error(`[Socket.IO ERROR] Fallo al procesar/enviar mensaje: ${error}`);
            // Podrías emitir un evento de error al remitente
            socket.emit('messageError', 'Fallo al enviar el mensaje.');
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Socket.IO] Usuario desconectado: ${socket.id}`);
    });
});
// *** FIN Lógica de Socket.IO ***


async function initializeDatabase() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('Data Source has been initialized!');
        }

        const roleRepository = AppDataSource.getRepository(Role);
        const rolesToSeed: RoleName[] = [RoleName.PATIENT, RoleName.NUTRITIONIST, RoleName.ADMIN];

        for (const roleName of rolesToSeed) {
            let role = await roleRepository.findOneBy({ name: roleName });
            if (!role) {
                role = roleRepository.create({ name: roleName });
                await roleRepository.save(role);
            }
        }
    } catch (err) {
        console.error('Error during Data Source initialization or seeding:', err);
        process.exit(1);
    }
}

async function startServer() {
    await initializeDatabase();

    server.listen(PORT, () => { // Usar 'server' en lugar de 'app' para escuchar
        console.log(`Server is running on port ${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api`);
        console.log(`Socket.IO available on ws://localhost:${PORT}`);
    });
}

startServer();
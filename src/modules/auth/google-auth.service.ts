import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { Role, RoleName } from '../../database/entities/role.entity';
import { AppError } from '../../utils/app.error';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
}

interface GoogleTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
}

class GoogleAuthService {
    private userRepository: Repository<User>;
    private roleRepository: Repository<Role>;
    private JWT_SECRET: string;
    private JWT_EXPIRES_IN: string;
    private GOOGLE_CLIENT_ID: string;
    private GOOGLE_CLIENT_SECRET: string;
    private GOOGLE_REDIRECT_URI: string;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.roleRepository = AppDataSource.getRepository(Role);
        this.JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
        this.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
        this.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
        this.GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback';
    }

    /**
     * Genera la URL de autorización de Google
     */
    public getAuthUrl(): string {
        const params = new URLSearchParams({
            client_id: this.GOOGLE_CLIENT_ID,
            redirect_uri: this.GOOGLE_REDIRECT_URI,
            response_type: 'code',
            scope: 'openid email profile https://www.googleapis.com/auth/calendar',
            access_type: 'offline',
            prompt: 'consent'
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    /**
     * Intercambia el código de autorización por tokens
     */
    private async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
        try {
            const response = await axios.post('https://oauth2.googleapis.com/token', {
                client_id: this.GOOGLE_CLIENT_ID,
                client_secret: this.GOOGLE_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: this.GOOGLE_REDIRECT_URI
            });

            return response.data;
        } catch (error) {
            console.error('Error exchanging code for tokens:', error);
            throw new AppError('Error al obtener tokens de Google', 400);
        }
    }

    /**
     * Obtiene información del usuario de Google
     */
    private async getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
        try {
            const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error getting Google user info:', error);
            throw new AppError('Error al obtener información del usuario de Google', 400);
        }
    }

    /**
     * Genera un token JWT para el usuario
     */
    private generateToken(userId: string, role: RoleName): string {
        if (!this.JWT_SECRET) {
            throw new AppError('JWT_SECRET no está configurado. Contacte al administrador.', 500);
        }
        const payload = { userId, role };
        const secret: jwt.Secret = this.JWT_SECRET;
        const options: jwt.SignOptions = {
            expiresIn: this.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
        };
        return jwt.sign(payload, secret, options);
    }

    /**
     * Busca o crea un usuario basado en la información de Google
     */
    private async findOrCreateUser(googleUserInfo: GoogleUserInfo, tokens: GoogleTokenResponse): Promise<User> {
        // Buscar usuario por Google ID
        let user = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.google_id = :googleId', { googleId: googleUserInfo.id })
            .getOne();

        if (!user) {
            // Buscar por email
            user = await this.userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.role', 'role')
                .where('user.email = :email', { email: googleUserInfo.email })
                .getOne();

            if (user) {
                // Actualizar usuario existente con Google ID
                user.google_id = googleUserInfo.id;
                user.auth_provider = 'google';
            } else {
                // Crear nuevo usuario
                const defaultRole = await this.roleRepository.findOne({ where: { name: RoleName.PATIENT } });
                if (!defaultRole) {
                    throw new AppError('Rol por defecto no encontrado', 500);
                }

                user = this.userRepository.create({
                    email: googleUserInfo.email,
                    first_name: googleUserInfo.given_name,
                    last_name: googleUserInfo.family_name,
                    profile_image: googleUserInfo.picture,
                    google_id: googleUserInfo.id,
                    google_email: googleUserInfo.email,
                    auth_provider: 'google',
                    role: defaultRole,
                    is_active: true
                });
            }
        }

        // Actualizar tokens de Google
        user.google_access_token = tokens.access_token;
        if (tokens.refresh_token) {
            user.google_refresh_token = tokens.refresh_token;
        }
        user.google_token_expires_at = new Date(Date.now() + (tokens.expires_in * 1000));

        await this.userRepository.save(user);
        return user;
    }

    /**
     * Maneja el callback de Google OAuth
     */
    public async handleCallback(code: string): Promise<{ user: User; token: string }> {
        try {
            // Intercambiar código por tokens
            const tokens = await this.exchangeCodeForTokens(code);

            // Obtener información del usuario
            const googleUserInfo = await this.getGoogleUserInfo(tokens.access_token);

            // Buscar o crear usuario
            const user = await this.findOrCreateUser(googleUserInfo, tokens);

            // Generar token JWT
            const token = this.generateToken(user.id, user.role.name);

            return { user, token };
        } catch (error) {
            console.error('Error in Google OAuth callback:', error);
            throw error;
        }
    }

    /**
     * Refresca el token de acceso de Google
     */
    public async refreshGoogleToken(userId: string): Promise<boolean> {
        try {
            const user = await this.userRepository
                .createQueryBuilder('user')
                .addSelect('user.google_refresh_token')
                .where('user.id = :userId', { userId })
                .getOne();

            if (!user || !user.google_refresh_token) {
                return false;
            }

            const response = await axios.post('https://oauth2.googleapis.com/token', {
                client_id: this.GOOGLE_CLIENT_ID,
                client_secret: this.GOOGLE_CLIENT_SECRET,
                refresh_token: user.google_refresh_token,
                grant_type: 'refresh_token'
            });

            const tokens = response.data;
            user.google_access_token = tokens.access_token;
            user.google_token_expires_at = new Date(Date.now() + (tokens.expires_in * 1000));

            await this.userRepository.save(user);
            return true;
        } catch (error) {
            console.error('Error refreshing Google token:', error);
            return false;
        }
    }

    /**
     * Desconecta la cuenta de Google
     */
    public async disconnectGoogle(userId: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new AppError('Usuario no encontrado', 404);
        }

        // Limpiar campos de Google
        user.google_id = null;
        user.google_email = null;
        user.google_access_token = null;
        user.google_refresh_token = null;
        user.google_token_expires_at = null;
        user.google_calendar_id = null;
        user.google_calendar_sync_enabled = false;
        user.google_calendar_last_sync = null;
        user.auth_provider = 'local';

        await this.userRepository.save(user);
    }

    /**
     * Verifica si el token de Google está expirado
     */
    public isGoogleTokenExpired(user: User): boolean {
        if (!user.google_token_expires_at) {
            return true;
        }
        return new Date() > user.google_token_expires_at;
    }

    /**
     * Obtiene un token de acceso válido para Google
     */
    public async getValidGoogleToken(userId: string): Promise<string | null> {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.google_access_token')
            .addSelect('user.google_refresh_token')
            .addSelect('user.google_token_expires_at')
            .where('user.id = :userId', { userId })
            .getOne();

        if (!user || !user.google_access_token) {
            return null;
        }

        if (this.isGoogleTokenExpired(user)) {
            const refreshed = await this.refreshGoogleToken(userId);
            if (!refreshed) {
                return null;
            }
            // Obtener el usuario actualizado
            const updatedUser = await this.userRepository
                .createQueryBuilder('user')
                .addSelect('user.google_access_token')
                .where('user.id = :userId', { userId })
                .getOne();
            return updatedUser?.google_access_token || null;
        }

        return user.google_access_token;
    }
}

export default new GoogleAuthService(); 
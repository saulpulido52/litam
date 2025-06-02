// src/modules/auth/auth.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { Role, RoleName } from '@/database/entities/role.entity';
import { RegisterPatientDto, RegisterNutritionistDto, LoginDto } from '@/modules/auth/auth.dto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from '@/utils/app.error';

dotenv.config();

class AuthService {
    private userRepository: Repository<User>;
    private roleRepository: Repository<Role>;
    private JWT_SECRET: string;
    private JWT_EXPIRES_IN: string;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.roleRepository = AppDataSource.getRepository(Role);
        this.JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
    }

    private generateToken(userId: string, roleName: RoleName): string {
        if (!this.JWT_SECRET) {
            throw new AppError('JWT_SECRET no está configurado. Contacte al administrador.', 500);
        }

        const payload = { userId, role: roleName };
        const secret: jwt.Secret = this.JWT_SECRET;
        
        // CORRECCIÓN CLAVE AQUÍ: Castear expiresIn a un tipo compatible
        const options: jwt.SignOptions = { 
            expiresIn: this.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] 
        };
        // O una alternativa más agresiva si la anterior no funciona:
        // const options: jwt.SignOptions = { expiresIn: this.JWT_EXPIRES_IN as any };


        return jwt.sign(
            payload,
            secret,
            options
        );
    }



    public async registerPatient(registerDto: RegisterPatientDto) {
        const { email, password, firstName, lastName, age, gender } = registerDto;

        console.log('[DEBUG] Intentando registrar paciente:', email); // DEBUG LOG
        const existingUser = await this.userRepository.findOneBy({ email });
        if (existingUser) {
            console.log('[DEBUG] Email ya registrado:', email); // DEBUG LOG
            throw new AppError('El email ya está registrado.', 409);
        }

        const patientRole = await this.roleRepository.findOneBy({ name: RoleName.PATIENT });
        console.log('[DEBUG] Rol de paciente encontrado:', patientRole ? patientRole.name : 'NO ENCONTRADO'); // DEBUG LOG
        if (!patientRole) {
            console.error('[ERROR] Rol de paciente NO encontrado en la base de datos. Asegúrate de que los roles se siembren.'); // DEBUG LOG
            throw new AppError('Rol de paciente no encontrado. Contacte al administrador.', 500);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = this.userRepository.create({
            email,
            password_hash: hashedPassword,
            first_name: firstName,
            last_name: lastName,
            age,
            gender,
            role: patientRole,
            is_active: true,
        });

        try {
            await this.userRepository.save(newUser);
            console.log('[DEBUG] Paciente guardado con éxito, ID:', newUser.id); // DEBUG LOG
        } catch (dbError: any) {
            console.error('[ERROR] Error al guardar nuevo paciente en BD:', dbError.message || dbError); // CRITICAL DEBUG LOG
            throw new AppError('Error interno al guardar el usuario.', 500);
        }

        const token = this.generateToken(newUser.id, patientRole.name);
        console.log('[DEBUG] Token generado para paciente:', newUser.id); // DEBUG LOG

        const { password_hash, ...userWithoutHash } = newUser;
        return { user: userWithoutHash, token };
    }

    public async registerNutritionist(registerDto: RegisterNutritionistDto) {
        const { email, password, firstName, lastName } = registerDto;

        console.log('[DEBUG] Intentando registrar nutriólogo:', email); // DEBUG LOG
        const existingUser = await this.userRepository.findOneBy({ email });
        if (existingUser) {
            console.log('[DEBUG] Email ya registrado:', email); // DEBUG LOG
            throw new AppError('El email ya está registrado.', 409);
        }

        const nutritionistRole = await this.roleRepository.findOneBy({ name: RoleName.NUTRITIONIST });
        console.log('[DEBUG] Rol de nutriólogo encontrado:', nutritionistRole ? nutritionistRole.name : 'NO ENCONTRADO'); // DEBUG LOG
        if (!nutritionistRole) {
            console.error('[ERROR] Rol de nutriólogo NO encontrado en la base de datos. Asegúrate de que los roles se siembren.'); // DEBUG LOG
            throw new AppError('Rol de nutriólogo no encontrado. Contacte al administrador.', 500);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = this.userRepository.create({
            email,
            password_hash: hashedPassword,
            first_name: firstName,
            last_name: lastName,
            role: nutritionistRole,
            is_active: true,
        });

        try {
            await this.userRepository.save(newUser);
            console.log('[DEBUG] Nutriólogo guardado con éxito, ID:', newUser.id); // DEBUG LOG
        } catch (dbError: any) {
            console.error('[ERROR] Error al guardar nuevo nutriólogo en BD:', dbError.message || dbError); // CRITICAL DEBUG LOG
            throw new AppError('Error interno al guardar el usuario.', 500);
        }

        const token = this.generateToken(newUser.id, nutritionistRole.name);
        console.log('[DEBUG] Token generado para nutriólogo:', newUser.id); // DEBUG LOG

        const { password_hash, ...userWithoutHash } = newUser;
        return { user: userWithoutHash, token };
    }

    public async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password_hash')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.email = :email', { email })
            .getOne();

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            throw new AppError('Credenciales inválidas.', 401);
        }

        const token = this.generateToken(user.id, user.role.name);

        const { password_hash, ...userWithoutHash } = user;
        return { user: userWithoutHash, token };
    }
}

export default new AuthService();
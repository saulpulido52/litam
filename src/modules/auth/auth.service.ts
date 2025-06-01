import { Repository } from 'typeorm';
import { AppDataSource } from '@/database/data-source'; // Ruta corregida
import { User } from '@/database/entities/user.entity'; // Ruta corregida
import { Role, RoleName } from '@/database/entities/role.entity'; // Ruta corregida
import { RegisterPatientDto, RegisterNutritionistDto, LoginDto } from '@/modules/auth/auth.dto'; // Ruta corregida
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
        const expiresIn: string | number = this.JWT_EXPIRES_IN; // Tipo explícito para JWT
        return jwt.sign(
            { userId, role: roleName },
            this.JWT_SECRET,
            { expiresIn }
        );
    }

    public async registerPatient(registerDto: RegisterPatientDto) {
        const { email, password, firstName, lastName, age, gender } = registerDto;

        const existingUser = await this.userRepository.findOneBy({ email });
        if (existingUser) {
            throw new AppError('El email ya está registrado.', 409);
        }

        const patientRole = await this.roleRepository.findOneBy({ name: RoleName.PATIENT });
        if (!patientRole) {
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

        await this.userRepository.save(newUser);

        const token = this.generateToken(newUser.id, patientRole.name);

        const { password_hash, ...userWithoutHash } = newUser;
        return { user: userWithoutHash, token };
    }

    public async registerNutritionist(registerDto: RegisterNutritionistDto) {
        const { email, password, firstName, lastName } = registerDto;

        const existingUser = await this.userRepository.findOneBy({ email });
        if (existingUser) {
            throw new AppError('El email ya está registrado.', 409);
        }

        const nutritionistRole = await this.roleRepository.findOneBy({ name: RoleName.NUTRITIONIST });
        if (!nutritionistRole) {
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

        await this.userRepository.save(newUser);

        const token = this.generateToken(newUser.id, nutritionistRole.name);

        const { password_hash, ...userWithoutHash } = newUser;
        return { user: userWithoutHash, token };
    }

    public async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password_hash')
            .leftJoinAndSelect('user.role', 'role') // Asegura que el rol se carga
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
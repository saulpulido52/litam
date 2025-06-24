// users.service.ts 
import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source'; // Ruta corregida
import { User } from '../../database/entities/user.entity'; // Ruta corregida
import { UpdateUserDto } from '../../modules/auth/auth.dto'; // Ruta corregida
import { AppError } from '../../utils/app.error'; // Importar AppError

class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    public async getUserProfile(userId: string) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.role', 'role')
            .where('user.id = :userId', { userId })
            .getOne();

        if (!user) {
            throw new AppError('Usuario no encontrado.', 404); // Usar AppError
        }

        const { password_hash, ...userWithoutHash } = user;
        return userWithoutHash;
    }

    public async updateProfile(userId: string, updateDto: UpdateUserDto) {
        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            throw new AppError('Usuario no encontrado.', 404); // Usar AppError
        }

        if (updateDto.firstName !== undefined) user.first_name = updateDto.firstName;
        if (updateDto.lastName !== undefined) user.last_name = updateDto.lastName;
        if (updateDto.age !== undefined) user.age = updateDto.age;
        if (updateDto.gender !== undefined) user.gender = updateDto.gender;

        await this.userRepository.save(user);

        const { password_hash, ...userWithoutHash } = user;
        return userWithoutHash;
    }
}

export default new UserService();
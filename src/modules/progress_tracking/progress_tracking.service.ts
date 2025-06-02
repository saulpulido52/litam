// src/modules/progress_tracking/progress_tracking.service.ts
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, FindOptionsWhere } from 'typeorm'; // Importar operadores
import { AppDataSource } from '@/database/data-source';
import { User } from '@/database/entities/user.entity';
import { PatientProgressLog } from '@/database/entities/patient_progress_log.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '@/database/entities/patient_nutritionist_relation.entity';
import {
    CreateUpdateProgressLogDto,
    SearchProgressLogsDto,
} from '@/modules/progress_tracking/progress_tracking.dto';
import { AppError } from '@/utils/app.error';
import { RoleName } from '@/database/entities/role.entity';

class ProgressTrackingService {
    private userRepository: Repository<User>;
    private progressLogRepository: Repository<PatientProgressLog>;
    private relationRepository: Repository<PatientNutritionistRelation>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.progressLogRepository = AppDataSource.getRepository(PatientProgressLog);
        this.relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    }

    // --- Private Helper Methods ---

    /**
     * Construye la parte de la consulta de TypeORM para el filtrado por rango de fechas.
     * @param searchDto Objeto con startDate y endDate opcionales.
     * @returns Un objeto de consulta parcial para la propiedad 'date'.
     */
    private _buildDateRangeQuery(searchDto: SearchProgressLogsDto): FindOptionsWhere<PatientProgressLog>['date'] | undefined {
        const { startDate, endDate } = searchDto;
        let dateCondition: FindOptionsWhere<PatientProgressLog>['date'];

        if (startDate && endDate) {
            // Ambos rangos: usar Between
            dateCondition = Between(new Date(startDate), new Date(endDate));
        } else if (startDate) {
            // Solo fecha de inicio: desde la fecha en adelante
            dateCondition = MoreThanOrEqual(new Date(startDate));
        } else if (endDate) {
            // Solo fecha de fin: hasta la fecha
            dateCondition = LessThanOrEqual(new Date(endDate));
        }
        // Si no hay fechas, dateCondition será undefined, lo cual es manejado correctamente
        return dateCondition;
    }

    // --- Métodos para Pacientes (registrar/ver su propio progreso) ---

    public async createProgressLog(patientId: string, logDto: CreateUpdateProgressLogDto) {
        const patient = await this.userRepository.findOne({
            where: { id: patientId, role: { name: RoleName.PATIENT } },
        });
        if (!patient) {
            throw new AppError('Paciente no encontrado o no autorizado.', 403);
        }

        const newLog = this.progressLogRepository.create({
            patient: patient,
            date: new Date(logDto.date),
            weight: logDto.weight,
            body_fat_percentage: logDto.bodyFatPercentage,
            muscle_mass_percentage: logDto.muscleMassPercentage,
            measurements: logDto.measurements,
            notes: logDto.notes,
            // Consistencia: Mapear las fotos para que las fechas sean objetos Date
            photos: logDto.photos?.map(photo => ({
                ...photo,
                date: photo.date ? new Date(photo.date) : undefined
            })),
            adherence_to_plan: logDto.adherenceToPlan,
            feeling_level: logDto.feelingLevel,
        });

        await this.progressLogRepository.save(newLog);
        return newLog;
    }

    public async getMyProgressLogs(patientId: string, searchDto: SearchProgressLogsDto) {
        const where: FindOptionsWhere<PatientProgressLog> = {
            patient: { id: patientId }
        };

        const dateCondition = this._buildDateRangeQuery(searchDto);
        if (dateCondition) {
            where.date = dateCondition;
        }

        const logs = await this.progressLogRepository.find({
            where: where,
            order: { date: 'DESC', created_at: 'DESC' }, // Ordenar por fecha de log, luego creación
        });
        return logs;
    }

    public async updateProgressLog(logId: string, patientId: string, updateDto: CreateUpdateProgressLogDto) {
        const log = await this.progressLogRepository.findOne({
            where: { id: logId, patient: { id: patientId } }, // Asegura que el paciente es el dueño
        });

        if (!log) {
            throw new AppError('Registro de progreso no encontrado o no autorizado para actualizar.', 404);
        }

        // Mapear los campos del DTO al log, solo si están definidos en el DTO
        if (updateDto.date !== undefined) log.date = new Date(updateDto.date);
        if (updateDto.weight !== undefined) log.weight = updateDto.weight;
        if (updateDto.bodyFatPercentage !== undefined) log.body_fat_percentage = updateDto.bodyFatPercentage;
        if (updateDto.muscleMassPercentage !== undefined) log.muscle_mass_percentage = updateDto.muscleMassPercentage;
        if (updateDto.measurements !== undefined) log.measurements = updateDto.measurements;
        if (updateDto.notes !== undefined) log.notes = updateDto.notes;
        if (updateDto.photos !== undefined) {
            // Asegúrate de que las fechas en las fotos también se conviertan a Date
            log.photos = updateDto.photos.map(photo => ({
                ...photo,
                date: photo.date ? new Date(photo.date) : undefined
            }));
        }
        if (updateDto.adherenceToPlan !== undefined) log.adherence_to_plan = updateDto.adherenceToPlan;
        if (updateDto.feelingLevel !== undefined) log.feeling_level = updateDto.feelingLevel;

        await this.progressLogRepository.save(log);
        return log;
    }

    public async deleteProgressLog(logId: string, patientId: string) {
        const log = await this.progressLogRepository.findOne({
            where: { id: logId, patient: { id: patientId } },
        });

        if (!log) {
            throw new AppError('Registro de progreso no encontrado o no autorizado para eliminar.', 404);
        }

        await this.progressLogRepository.remove(log);
        return { message: 'Registro de progreso eliminado con éxito.' };
    }


    // --- Métodos para Nutriólogos (ver progreso de sus pacientes) ---

    public async getPatientProgressLogsByNutritionist(patientId: string, nutritionistId: string, searchDto: SearchProgressLogsDto) {
        // 1. Verificar que el nutriólogo está vinculado activamente con este paciente
        const activeRelation = await this.relationRepository.findOne({
            where: {
                patient: { id: patientId },
                nutritionist: { id: nutritionistId },
                status: RelationshipStatus.ACTIVE,
            },
        });
        if (!activeRelation) {
            throw new AppError('No estás vinculado con este paciente o no tienes permiso para ver su progreso.', 403);
        }

        const where: FindOptionsWhere<PatientProgressLog> = {
            patient: { id: patientId }
        };

        const dateCondition = this._buildDateRangeQuery(searchDto);
        if (dateCondition) {
            where.date = dateCondition;
        }

        const logs = await this.progressLogRepository.find({
            where: where,
            order: { date: 'DESC', created_at: 'DESC' },
        });
        return logs;
    }
}

export default new ProgressTrackingService();
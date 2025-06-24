// src/modules/relations/relation.service.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { User } from '../../database/entities/user.entity';
import { PatientNutritionistRelation, RelationshipStatus } from '../../database/entities/patient_nutritionist_relation.entity';
import { RequestRelationDto } from '../../modules/relations/relation.dto';
import { AppError } from '../../utils/app.error';
import { RoleName } from '../../database/entities/role.entity';

class RelationService {
    private userRepository: Repository<User>;
    private relationRepository: Repository<PatientNutritionistRelation>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.relationRepository = AppDataSource.getRepository(PatientNutritionistRelation);
    }

    // --- Métodos para Pacientes ---

    public async requestRelation(patientId: string, requestDto: RequestRelationDto) {
        const nutritionistId = requestDto.nutritionistId;

        // Verificar que el paciente existe y tiene el rol correcto
        const patient = await this.userRepository.findOne({
            where: { id: patientId, role: { name: RoleName.PATIENT } },
        });
        if (!patient) {
            throw new AppError('Paciente no encontrado o no autorizado para esta acción.', 404);
        }

        // Verificar que el nutriólogo existe y tiene el rol correcto
        const nutritionist = await this.userRepository.findOne({
            where: { id: nutritionistId, role: { name: RoleName.NUTRITIONIST } },
        });
        if (!nutritionist) {
            throw new AppError('Nutriólogo no encontrado.', 404);
        }

        // Verificar si ya existe una relación pendiente o activa
        const existingRelation = await this.relationRepository.findOne({
            where: [
                { patient: { id: patientId }, nutritionist: { id: nutritionistId }, status: RelationshipStatus.PENDING },
                { patient: { id: patientId }, nutritionist: { id: nutritionistId }, status: RelationshipStatus.ACTIVE },
            ],
        });
        if (existingRelation) {
            throw new AppError('Ya existe una solicitud pendiente o una relación activa con este nutriólogo.', 409); // 409 Conflict
        }

        // Crear la nueva solicitud de relación
        const newRelation = this.relationRepository.create({
            patient: patient,
            nutritionist: nutritionist,
            status: RelationshipStatus.PENDING,
            requested_at: new Date(),
        });

        await this.relationRepository.save(newRelation);
        return newRelation;
    }

    public async getPatientRequests(patientId: string) {
        const requests = await this.relationRepository.find({
            where: { patient: { id: patientId } },
            relations: ['nutritionist'], // Cargar datos básicos del nutriólogo
        });
        return requests;
    }

    public async getPatientActiveNutritionist(patientId: string) {
        const activeRelation = await this.relationRepository.findOne({
            where: { patient: { id: patientId }, status: RelationshipStatus.ACTIVE },
            relations: ['nutritionist'],
        });
        return activeRelation ? activeRelation.nutritionist : null;
    }

    // --- Métodos para Nutriólogos ---

    public async getNutritionistPendingRequests(nutritionistId: string) {
        const requests = await this.relationRepository.find({
            where: { nutritionist: { id: nutritionistId }, status: RelationshipStatus.PENDING },
            relations: ['patient'], // Cargar datos básicos del paciente
        });
        return requests;
    }

    public async getNutritionistPatients(nutritionistId: string) {
        const patients = await this.relationRepository.find({
            where: { nutritionist: { id: nutritionistId }, status: RelationshipStatus.ACTIVE },
            relations: ['patient'],
        });
        return patients; // Devuelve las relaciones, podrías mapear solo a los pacientes si fuera necesario
    }

    public async updateRelationStatus(relationId: string, nutritionistId: string, newStatus: RelationshipStatus) {
        const relation = await this.relationRepository.findOne({
            where: { id: relationId, nutritionist: { id: nutritionistId } }, // Asegurarse que el nutriólogo es el dueño de la relación
            relations: ['patient', 'nutritionist'], // Cargar para verificar roles si es necesario
        });

        if (!relation) {
            throw new AppError('Relación no encontrada o no autorizado para actualizar.', 404);
        }
        if (relation.status !== RelationshipStatus.PENDING && newStatus === RelationshipStatus.ACTIVE) {
            throw new AppError('Solo se pueden aceptar solicitudes pendientes.', 400);
        }

        // Lógica de transición de estados
        switch (newStatus) {
            case RelationshipStatus.ACTIVE:
                relation.status = RelationshipStatus.ACTIVE;
                relation.accepted_at = new Date();
                break;
            case RelationshipStatus.REJECTED:
                relation.status = RelationshipStatus.REJECTED;
                relation.ended_at = new Date(); // Puede marcarse como terminada al rechazar
                break;
            case RelationshipStatus.INACTIVE: // Para que el nutriólogo o paciente la pongan inactiva
            case RelationshipStatus.BLOCKED: // Para que el nutriólogo bloquee al paciente
                relation.status = newStatus;
                relation.ended_at = new Date(); // Marcar como terminada
                break;
            default:
                throw new AppError('Estado de relación no válido.', 400);
        }

        await this.relationRepository.save(relation);
        return relation;
    }
}

export default new RelationService();
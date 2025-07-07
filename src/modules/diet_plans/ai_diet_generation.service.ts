import { Repository } from 'typeorm';
import { Food } from '../../database/entities/food.entity';
import { PatientProfile } from '../../database/entities/patient_profile.entity';
import { AppError } from '../../utils/app.error';
import { GenerateDietPlanAiDto, CreateDietPlanDto, WeeklyPlanDto } from './diet_plan.dto';

export class DietGenerationAI {
    private foodRepository: Repository<Food>;
    private patientProfileRepository: Repository<PatientProfile>;

    constructor(foodRepository: Repository<Food>, patientProfileRepository: Repository<PatientProfile>) {
        this.foodRepository = foodRepository;
        this.patientProfileRepository = patientProfileRepository;
    }

    public async generateFullDietPlan(dto: GenerateDietPlanAiDto): Promise<Partial<CreateDietPlanDto>> {
        const dailyCalories = await this._calculateDailyCalories(dto);
        const weeklyPlans: WeeklyPlanDto[] = [];
        for (let week = 1; week <= (dto.totalWeeks || 1); week++) {
            const weeklyPlan = await this._generateWeeklyPlan(dto, week, dailyCalories);
            weeklyPlans.push(weeklyPlan);
        }
        return {
            name: dto.name,
            description: `Plan generado por IA - Objetivo: ${dto.goal}`,
            startDate: dto.startDate,
            endDate: dto.endDate,
            dailyCaloriesTarget: dailyCalories,
            isWeeklyPlan: true,
            totalWeeks: dto.totalWeeks,
            generatedByIA: true,
            iaVersion: '2.0-modular',
            weeklyPlans: weeklyPlans,
        };
    }

    private async _generateWeeklyPlan(dto: GenerateDietPlanAiDto, weekNumber: number, dailyCalories: number): Promise<WeeklyPlanDto> {
        // Aquí iría la lógica real de generación de comidas por IA
        return {
            weekNumber,
            startDate: dto.startDate, // Debería calcularse por semana
            endDate: dto.endDate,     // Debería calcularse por semana
            dailyCaloriesTarget: dailyCalories,
            dailyMacrosTarget: { protein: 150, carbohydrates: 200, fats: 60 },
            meals: [],
            notes: `Semana ${weekNumber} generada por IA.`
        };
    }

    private async _calculateDailyCalories(dto: GenerateDietPlanAiDto): Promise<number> {
        if (dto.dailyCaloriesTarget) {
            return dto.dailyCaloriesTarget;
        }
        const profile = await this.patientProfileRepository.findOneBy({ user: { id: dto.patientId }});
        if (!profile) {
            throw new AppError('No se encontró el perfil del paciente para calcular las calorías.', 404);
        }
        // Lógica real de cálculo de calorías aquí
        return 2200;
    }
} 
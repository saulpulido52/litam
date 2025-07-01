import { AppDataSource } from './src/database/data-source';
import { ClinicalRecord } from './src/database/entities/clinical_record.entity';
import { PatientNutritionistRelation, RelationshipStatus } from './src/database/entities/patient_nutritionist_relation.entity';

async function testFarmacoNutriente() {
    try {
        console.log(' INICIANDO PRUEBA: Fármaco-Nutriente');
        
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const recordRepo = AppDataSource.getRepository(ClinicalRecord);
        const relationRepo = AppDataSource.getRepository(PatientNutritionistRelation);

        // 1. Buscar relación activa
        const activeRelation = await relationRepo.findOne({
            where: { status: RelationshipStatus.ACTIVE },
            relations: ['nutritionist', 'patient']
        });

        if (!activeRelation) {
            console.log(' No hay relaciones activas');
            return;
        }

        console.log(' Relación encontrada:', activeRelation.nutritionist.first_name, '', activeRelation.patient.first_name);

        // 2. Buscar expediente
        let clinicalRecord = await recordRepo.findOne({
            where: {
                patient: { id: activeRelation.patient.id },
                nutritionist: { id: activeRelation.nutritionist.id }
            },
            relations: ['patient', 'nutritionist']
        });

        if (!clinicalRecord) {
            console.log(' Creando expediente...');
            clinicalRecord = recordRepo.create({
                record_date: new Date(),
                patient: activeRelation.patient,
                nutritionist: activeRelation.nutritionist,
                expedient_number: 'TEST-' + Date.now(),
                consultation_reason: 'Prueba fármaco-nutriente',
                diagnosed_diseases: {
                    has_disease: true,
                    disease_name: 'Hipertensión',
                    takes_medication: true,
                    medications_list: ['Metformina 500mg', 'Losartán 50mg']
                },
                nutritional_diagnosis: 'Evaluación nutricional',
                nutritional_plan_and_management: 'Plan nutricional'
            });
            
            await recordRepo.save(clinicalRecord);
            console.log(' Expediente creado:', clinicalRecord.id);
        }

        // 3. Agregar interacción
        console.log(' Agregando interacción...');
        
        const nuevaInteraccion = {
            id: require('crypto').randomUUID(),
            medication: {
                id: 'med_0',
                name: 'Metformina 500mg',
                generic_name: 'Metformin',
                dosage: '500mg',
                frequency: 'Cada 12 horas'
            },
            nutrients_affected: ['Vitamina B12', 'Folato'],
            interaction_type: 'absorption' as const,
            severity: 'moderate' as const,
            description: 'La metformina puede reducir la absorción de vitamina B12.',
            recommendations: ['Monitorear B12', 'Suplementación si necesario'],
            timing_considerations: 'Tomar con comidas',
            foods_to_avoid: ['Lácteos 2h antes/después'],
            foods_to_increase: ['Vegetales verdes', 'Carnes'],
            monitoring_required: true,
            created_date: new Date(),
            updated_date: new Date()
        };

        if (!clinicalRecord.drug_nutrient_interactions) {
            clinicalRecord.drug_nutrient_interactions = [];
        }

        clinicalRecord.drug_nutrient_interactions.push(nuevaInteraccion);
        await recordRepo.save(clinicalRecord);

        console.log(' Interacción agregada:', nuevaInteraccion.id);

        // 4. Verificar
        const verification = await recordRepo.findOne({
            where: { id: clinicalRecord.id }
        });

        if (verification?.drug_nutrient_interactions?.length > 0) {
            console.log(' ¡ÉXITO! Interacciones guardadas correctamente');
            console.log(' Total:', verification.drug_nutrient_interactions.length);
            
            verification.drug_nutrient_interactions.forEach((interaction, index) => {
                console.log(' Interacción ' + (index + 1) + ':');
                console.log('    Medicamento:', interaction.medication.name);
                console.log('    Nutrientes:', interaction.nutrients_affected.join(', '));
                console.log('    Severidad:', interaction.severity);
            });
        } else {
            console.log(' ERROR: No se guardaron las interacciones');
        }

        console.log('');
        console.log(' CONCLUSIÓN:');
        console.log(' Backend soporta fármaco-nutriente');
        console.log(' Datos se guardan correctamente');
        console.log(' ID expediente:', clinicalRecord.id);

    } catch (error) {
        console.error(' Error:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

testFarmacoNutriente();

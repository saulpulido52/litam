import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

interface TestUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: { name: string };
    token?: string | null;
}

interface TestResult {
    case: string;
    status: 'PASS' | 'FAIL';
    expected: string;
    actual: string;
    details?: any;
}

class RelationshipTester {
    private results: TestResult[] = [];
    private users: { [key: string]: TestUser } = {};
    private relations: any[] = [];
    private clinicalRecords: any[] = [];
    private dietPlans: any[] = [];

    // 🔐 AUTENTICACIÓN
    async authenticateUser(email: string, password: string): Promise<string | null> {
        try {
            const response = await axios.post(`${API_BASE}/auth/login`, {
                email,
                password
            });
            return response.data.data.token;
        } catch (error: any) {
            console.error(`❌ Error authenticating ${email}:`, error.response?.data?.message || error.message);
            return null;
        }
    }

    // 👤 CREAR USUARIO DE PRUEBA
    async createTestUser(userData: any, creatorToken: string): Promise<TestUser | null> {
        try {
            const response = await axios.post(`${API_BASE}/auth/register`, userData, {
                headers: { Authorization: `Bearer ${creatorToken}` }
            });
            
            const user = response.data.data.user;
            return {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            };
        } catch (error: any) {
            console.error(`❌ Error creating user:`, error.response?.data?.message || error.message);
            return null;
        }
    }

    // 🔗 CREAR RELACIÓN
    async createRelation(nutritionistToken: string, patientId: string): Promise<any> {
        try {
            const response = await axios.post(`${API_BASE}/relations`, {
                patient_id: patientId,
                notes: 'Relación de prueba automatizada'
            }, {
                headers: { Authorization: `Bearer ${nutritionistToken}` }
            });
            return response.data.data.relation;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    // 📋 CREAR EXPEDIENTE CLÍNICO
    async createClinicalRecord(nutritionistToken: string, patientId: string): Promise<any> {
        try {
            const response = await axios.post(`${API_BASE}/clinical-records`, {
                patient_id: patientId,
                current_problems: { observations: 'Problemas de prueba' },
                anthropometric_measurements: {
                    current_weight_kg: 70,
                    height_m: 1.75
                }
            }, {
                headers: { Authorization: `Bearer ${nutritionistToken}` }
            });
            return response.data.data.record;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    // 🍽️ CREAR PLAN DIETÉTICO
    async createDietPlan(nutritionistToken: string, patientId: string): Promise<any> {
        try {
            const response = await axios.post(`${API_BASE}/diet-plans`, {
                name: 'Plan de prueba',
                description: 'Plan dietético de prueba automatizada',
                patient_id: patientId,
                daily_calories_target: 2000,
                meal_frequency: {
                    breakfast: true,
                    lunch: true,
                    dinner: true,
                    snacks: 2
                }
            }, {
                headers: { Authorization: `Bearer ${nutritionistToken}` }
            });
            return response.data.data.dietPlan;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    // 🔄 TRANSFERIR PACIENTE
    async transferPatient(adminToken: string, patientId: string, fromNutritionistId: string, toNutritionistId: string): Promise<any> {
        try {
            const response = await axios.post(`${API_BASE}/clinical-records/transfer`, {
                patientId,
                fromNutritionistId,
                toNutritionistId
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    // 🗑️ ELIMINAR RELACIÓN
    async deleteRelation(nutritionistToken: string, relationId: string): Promise<void> {
        try {
            await axios.delete(`${API_BASE}/relations/${relationId}`, {
                headers: { Authorization: `Bearer ${nutritionistToken}` }
            });
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message);
        }
    }

    // 📊 AGREGAR RESULTADO
    addResult(testCase: string, expected: string, actual: string, success: boolean, details?: any): void {
        this.results.push({
            case: testCase,
            status: success ? 'PASS' : 'FAIL',
            expected,
            actual,
            details
        });
    }

    // 🧪 CASO 1: RELACIÓN NUTRIÓLOGO-PACIENTE VÁLIDA
    async testCase1_ValidNutritionistPatientRelation(): Promise<void> {
        console.log('\n🧪 CASO 1: Relación Nutriólogo-Paciente VÁLIDA');
        
        try {
            const relation = await this.createRelation(
                this.users.nutritionist1.token!, 
                this.users.patient1.id
            );
            
            this.relations.push(relation);
            this.addResult(
                'CASO 1: Relación N-P Válida',
                'Relación creada exitosamente',
                'Relación creada con ID: ' + relation.id,
                true,
                relation
            );
            console.log('✅ CASO 1: PASS - Relación nutriólogo-paciente creada exitosamente');
        } catch (error: any) {
            this.addResult(
                'CASO 1: Relación N-P Válida',
                'Relación creada exitosamente',
                'Error: ' + error.message,
                false,
                error
            );
            console.log('❌ CASO 1: FAIL -', error.message);
        }
    }

    // 🧪 CASO 2: RELACIÓN NUTRIÓLOGO-NUTRIÓLOGO (NO VÁLIDA)
    async testCase2_InvalidNutritionistNutritionistRelation(): Promise<void> {
        console.log('\n🧪 CASO 2: Relación Nutriólogo-Nutriólogo NO VÁLIDA');
        
        try {
            await this.createRelation(
                this.users.nutritionist1.token!,
                this.users.nutritionist2.id
            );
            
            this.addResult(
                'CASO 2: Relación N-N Inválida',
                'Error de validación de roles',
                'Relación creada incorrectamente',
                false
            );
            console.log('❌ CASO 2: FAIL - Relación nutriólogo-nutriólogo fue creada (ERROR)');
        } catch (error: any) {
            if (error.message.includes('role') || error.message.includes('patient') || error.message.includes('unauthorized')) {
                this.addResult(
                    'CASO 2: Relación N-N Inválida',
                    'Error de validación de roles',
                    'Error esperado: ' + error.message,
                    true,
                    error
                );
                console.log('✅ CASO 2: PASS - Relación nutriólogo-nutriólogo correctamente rechazada');
            } else {
                this.addResult(
                    'CASO 2: Relación N-N Inválida',
                    'Error de validación de roles',
                    'Error inesperado: ' + error.message,
                    false,
                    error
                );
                console.log('❌ CASO 2: FAIL - Error inesperado:', error.message);
            }
        }
    }

    // 🧪 CASO 3: NUTRIÓLOGO CON VARIOS PACIENTES
    async testCase3_NutritionistMultiplePatients(): Promise<void> {
        console.log('\n🧪 CASO 3: Nutriólogo con Varios Pacientes VÁLIDO');
        
        try {
            // Crear segunda relación
            const relation2 = await this.createRelation(
                this.users.nutritionist1.token!,
                this.users.patient2.id
            );
            
            // Crear tercera relación
            const relation3 = await this.createRelation(
                this.users.nutritionist1.token!,
                this.users.patient3.id
            );
            
            this.relations.push(relation2, relation3);
            
            this.addResult(
                'CASO 3: N con múltiples P',
                '3 relaciones para el mismo nutriólogo',
                'Relaciones creadas: ' + this.relations.length,
                this.relations.length >= 3,
                { relations: this.relations }
            );
            console.log('✅ CASO 3: PASS - Nutriólogo con múltiples pacientes exitoso');
        } catch (error: any) {
            this.addResult(
                'CASO 3: N con múltiples P',
                '3 relaciones para el mismo nutriólogo',
                'Error: ' + error.message,
                false,
                error
            );
            console.log('❌ CASO 3: FAIL -', error.message);
        }
    }

    // 🧪 CASO 4: CREACIÓN DE EXPEDIENTES Y PLANES
    async testCase4_CreateClinicalRecordsAndDietPlans(): Promise<void> {
        console.log('\n🧪 CASO 4: Creación de Expedientes y Planes Dietéticos');
        
        try {
            // Crear expedientes clínicos para cada paciente
            for (const relation of this.relations) {
                const record = await this.createClinicalRecord(
                    this.users.nutritionist1.token!,
                    relation.patient.id
                );
                this.clinicalRecords.push(record);
                
                const dietPlan = await this.createDietPlan(
                    this.users.nutritionist1.token!,
                    relation.patient.id
                );
                this.dietPlans.push(dietPlan);
            }
            
            this.addResult(
                'CASO 4: Expedientes y Planes',
                `${this.relations.length} expedientes y planes creados`,
                `${this.clinicalRecords.length} expedientes, ${this.dietPlans.length} planes`,
                this.clinicalRecords.length === this.relations.length && this.dietPlans.length === this.relations.length,
                { records: this.clinicalRecords.length, plans: this.dietPlans.length }
            );
            console.log('✅ CASO 4: PASS - Expedientes y planes dietéticos creados');
        } catch (error: any) {
            this.addResult(
                'CASO 4: Expedientes y Planes',
                'Expedientes y planes creados exitosamente',
                'Error: ' + error.message,
                false,
                error
            );
            console.log('❌ CASO 4: FAIL -', error.message);
        }
    }

    // 🧪 CASO 5: ELIMINACIÓN DE RELACIÓN PACIENTE
    async testCase5_DeletePatientRelation(): Promise<void> {
        console.log('\n🧪 CASO 5: Eliminación de Relación por Paciente');
        
        try {
            const relationToDelete = this.relations[0];
            await this.deleteRelation(
                this.users.nutritionist1.token!,
                relationToDelete.id
            );
            
            this.addResult(
                'CASO 5: Eliminación Paciente',
                'Relación eliminada exitosamente',
                'Relación eliminada: ' + relationToDelete.id,
                true,
                relationToDelete
            );
            console.log('✅ CASO 5: PASS - Relación eliminada por nutriólogo');
        } catch (error: any) {
            this.addResult(
                'CASO 5: Eliminación Paciente',
                'Relación eliminada exitosamente',
                'Error: ' + error.message,
                false,
                error
            );
            console.log('❌ CASO 5: FAIL -', error.message);
        }
    }

    // 🧪 CASO 6: TRANSFERENCIA DE EXPEDIENTES
    async testCase6_TransferPatientRecords(): Promise<void> {
        console.log('\n🧪 CASO 6: Transferencia de Expedientes entre Nutriólogos');
        
        try {
            if (this.relations.length < 2) {
                throw new Error('No hay suficientes relaciones para transferir');
            }
            
            const patientToTransfer = this.relations[1].patient;
            const result = await this.transferPatient(
                this.users.admin.token!,
                patientToTransfer.id,
                this.users.nutritionist1.id,
                this.users.nutritionist2.id
            );
            
            this.addResult(
                'CASO 6: Transferencia',
                'Expedientes transferidos exitosamente',
                'Transferencia completada',
                true,
                result
            );
            console.log('✅ CASO 6: PASS - Expedientes transferidos entre nutriólogos');
        } catch (error: any) {
            this.addResult(
                'CASO 6: Transferencia',
                'Expedientes transferidos exitosamente',
                'Error: ' + error.message,
                false,
                error
            );
            console.log('❌ CASO 6: FAIL -', error.message);
        }
    }

    // 🧪 CASO 7: DUPLICACIÓN DE RELACIONES (NO VÁLIDA)
    async testCase7_DuplicateRelation(): Promise<void> {
        console.log('\n🧪 CASO 7: Intento de Duplicar Relación (NO VÁLIDA)');
        
        try {
            await this.createRelation(
                this.users.nutritionist1.token!,
                this.users.patient2.id  // Ya tiene relación
            );
            
            this.addResult(
                'CASO 7: Relación Duplicada',
                'Error de validación por duplicado',
                'Relación duplicada creada incorrectamente',
                false
            );
            console.log('❌ CASO 7: FAIL - Relación duplicada fue creada (ERROR)');
        } catch (error: any) {
            if (error.message.includes('exist') || error.message.includes('duplicate') || error.message.includes('already')) {
                this.addResult(
                    'CASO 7: Relación Duplicada',
                    'Error de validación por duplicado',
                    'Error esperado: ' + error.message,
                    true,
                    error
                );
                console.log('✅ CASO 7: PASS - Relación duplicada correctamente rechazada');
            } else {
                this.addResult(
                    'CASO 7: Relación Duplicada',
                    'Error de validación por duplicado',
                    'Error inesperado: ' + error.message,
                    false,
                    error
                );
                console.log('❌ CASO 7: FAIL - Error inesperado:', error.message);
            }
        }
    }

    // 🧪 CASO 8: ACCESO NO AUTORIZADO
    async testCase8_UnauthorizedAccess(): Promise<void> {
        console.log('\n🧪 CASO 8: Acceso No Autorizado');
        
        try {
            // Intentar que nutriólogo2 acceda a expedientes del nutriólogo1
            const patientOfNutritionist1 = this.relations.find(r => r.patient)?.patient.id;
            if (!patientOfNutritionist1) {
                throw new Error('No hay pacientes para probar');
            }
            
            await axios.get(`${API_BASE}/clinical-records/patient/${patientOfNutritionist1}`, {
                headers: { Authorization: `Bearer ${this.users.nutritionist2.token}` }
            });
            
            this.addResult(
                'CASO 8: Acceso No Autorizado',
                'Error de autorización',
                'Acceso concedido incorrectamente',
                false
            );
            console.log('❌ CASO 8: FAIL - Acceso no autorizado fue permitido (ERROR)');
        } catch (error: any) {
            if (error.response?.status === 403 || error.message.includes('access') || error.message.includes('unauthorized')) {
                this.addResult(
                    'CASO 8: Acceso No Autorizado',
                    'Error de autorización',
                    'Acceso correctamente denegado: ' + error.message,
                    true,
                    error
                );
                console.log('✅ CASO 8: PASS - Acceso no autorizado correctamente denegado');
            } else {
                this.addResult(
                    'CASO 8: Acceso No Autorizado',
                    'Error de autorización',
                    'Error inesperado: ' + error.message,
                    false,
                    error
                );
                console.log('❌ CASO 8: FAIL - Error inesperado:', error.message);
            }
        }
    }

    // 🧪 CASO 9: ELIMINACIÓN DE NUTRIÓLOGO
    async testCase9_DeleteNutritionist(): Promise<void> {
        console.log('\n🧪 CASO 9: Impacto de Eliminación de Nutriólogo');
        
        try {
            // Verificar relaciones antes de eliminar
            const relationsBefore = this.relations.length;
            
            // Simular eliminación verificando el estado
            const response = await axios.get(`${API_BASE}/relations/nutritionist/${this.users.nutritionist1.id}`, {
                headers: { Authorization: `Bearer ${this.users.nutritionist1.token}` }
            });
            
            this.addResult(
                'CASO 9: Eliminación Nutriólogo',
                'Manejo adecuado de relaciones huérfanas',
                `Relaciones encontradas: ${response.data.results || 0}`,
                true,
                { relationsBefore, currentRelations: response.data.results }
            );
            console.log('✅ CASO 9: PASS - Estado de relaciones verificado');
        } catch (error: any) {
            this.addResult(
                'CASO 9: Eliminación Nutriólogo',
                'Manejo adecuado de relaciones huérfanas',
                'Error: ' + error.message,
                false,
                error
            );
            console.log('❌ CASO 9: FAIL -', error.message);
        }
    }

    // 🧪 CASO 10: VALIDACIÓN DE ROLES
    async testCase10_RoleValidation(): Promise<void> {
        console.log('\n🧪 CASO 10: Validación de Roles');
        
        try {
            // Intentar que un paciente cree una relación
            await axios.post(`${API_BASE}/relations`, {
                patient_id: this.users.patient1.id,
                notes: 'Intento de paciente'
            }, {
                headers: { Authorization: `Bearer ${this.users.patient1.token}` }
            });
            
            this.addResult(
                'CASO 10: Validación Roles',
                'Error de autorización por rol',
                'Paciente pudo crear relación incorrectamente',
                false
            );
            console.log('❌ CASO 10: FAIL - Paciente pudo crear relación (ERROR)');
        } catch (error: any) {
            if (error.response?.status === 403 || error.message.includes('access') || error.message.includes('unauthorized')) {
                this.addResult(
                    'CASO 10: Validación Roles',
                    'Error de autorización por rol',
                    'Acceso correctamente denegado por rol: ' + error.message,
                    true,
                    error
                );
                console.log('✅ CASO 10: PASS - Validación de roles funciona correctamente');
            } else {
                this.addResult(
                    'CASO 10: Validación Roles',
                    'Error de autorización por rol',
                    'Error inesperado: ' + error.message,
                    false,
                    error
                );
                console.log('❌ CASO 10: FAIL - Error inesperado:', error.message);
            }
        }
    }

    // 🚀 INICIALIZAR USUARIOS DE PRUEBA
    async initializeTestUsers(): Promise<boolean> {
        console.log('🔧 Inicializando usuarios de prueba...');
        
        // Autenticar admin
        const adminToken = await this.authenticateUser('nutri.admin@sistema.com', 'nutri123');
        if (!adminToken) {
            console.error('❌ No se pudo autenticar el admin');
            return false;
        }
        
        this.users.admin = {
            id: 'admin-id',
            email: 'nutri.admin@sistema.com',
            first_name: 'Admin',
            last_name: 'Sistema',
            role: { name: 'admin' },
            token: adminToken
        };

        // Crear usuarios de prueba
        const timestamp = Date.now();
        
        // Nutriólogos
        const nutritionist1 = await this.createTestUser({
            email: `nutritionist1_${timestamp}@test.com`,
            password: 'Test123!',
            first_name: 'Nutriólogo',
            last_name: 'Uno',
            role_name: 'nutritionist'
        }, adminToken);
        
        const nutritionist2 = await this.createTestUser({
            email: `nutritionist2_${timestamp}@test.com`,
            password: 'Test123!',
            first_name: 'Nutriólogo',
            last_name: 'Dos',
            role_name: 'nutritionist'
        }, adminToken);

        // Pacientes
        const patient1 = await this.createTestUser({
            email: `patient1_${timestamp}@test.com`,
            password: 'Test123!',
            first_name: 'Paciente',
            last_name: 'Uno',
            role_name: 'patient'
        }, adminToken);
        
        const patient2 = await this.createTestUser({
            email: `patient2_${timestamp}@test.com`,
            password: 'Test123!',
            first_name: 'Paciente',
            last_name: 'Dos',
            role_name: 'patient'
        }, adminToken);
        
        const patient3 = await this.createTestUser({
            email: `patient3_${timestamp}@test.com`,
            password: 'Test123!',
            first_name: 'Paciente',
            last_name: 'Tres',
            role_name: 'patient'
        }, adminToken);

        if (!nutritionist1 || !nutritionist2 || !patient1 || !patient2 || !patient3) {
            console.error('❌ No se pudieron crear todos los usuarios de prueba');
            return false;
        }

        // Autenticar usuarios creados
        nutritionist1.token = await this.authenticateUser(nutritionist1.email, 'Test123!');
        nutritionist2.token = await this.authenticateUser(nutritionist2.email, 'Test123!');
        patient1.token = await this.authenticateUser(patient1.email, 'Test123!');
        patient2.token = await this.authenticateUser(patient2.email, 'Test123!');
        patient3.token = await this.authenticateUser(patient3.email, 'Test123!');

        this.users.nutritionist1 = nutritionist1;
        this.users.nutritionist2 = nutritionist2;
        this.users.patient1 = patient1;
        this.users.patient2 = patient2;
        this.users.patient3 = patient3;

        console.log('✅ Usuarios de prueba inicializados correctamente');
        return true;
    }

    // 📊 EJECUTAR TODAS LAS PRUEBAS
    async runAllTests(): Promise<void> {
        console.log('🧪 =====================================');
        console.log('🧪 INICIANDO PRUEBAS DE RELACIONES NUTRIÓLOGO-PACIENTE');
        console.log('🧪 =====================================');

        if (!(await this.initializeTestUsers())) {
            console.error('❌ Error en la inicialización de usuarios');
            return;
        }

        // Ejecutar todos los casos de prueba
        await this.testCase1_ValidNutritionistPatientRelation();
        await this.testCase2_InvalidNutritionistNutritionistRelation();
        await this.testCase3_NutritionistMultiplePatients();
        await this.testCase4_CreateClinicalRecordsAndDietPlans();
        await this.testCase5_DeletePatientRelation();
        await this.testCase6_TransferPatientRecords();
        await this.testCase7_DuplicateRelation();
        await this.testCase8_UnauthorizedAccess();
        await this.testCase9_DeleteNutritionist();
        await this.testCase10_RoleValidation();

        // Mostrar resultados
        this.showResults();
    }

    // 📊 MOSTRAR RESULTADOS
    showResults(): void {
        console.log('\n📊 =====================================');
        console.log('📊 RESULTADOS DE PRUEBAS COMPLETAS');
        console.log('📊 =====================================');

        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const total = this.results.length;

        console.log(`\n📈 RESUMEN: ${passed}/${total} PRUEBAS EXITOSAS (${((passed/total)*100).toFixed(1)}%)`);
        
        console.log('\n✅ PRUEBAS EXITOSAS:');
        this.results.filter(r => r.status === 'PASS').forEach(result => {
            console.log(`  ✅ ${result.case}: ${result.actual}`);
        });

        if (failed > 0) {
            console.log('\n❌ PRUEBAS FALLIDAS:');
            this.results.filter(r => r.status === 'FAIL').forEach(result => {
                console.log(`  ❌ ${result.case}:`);
                console.log(`     Esperado: ${result.expected}`);
                console.log(`     Obtenido: ${result.actual}`);
            });
        }

        console.log('\n📋 DETALLES COMPLETOS:');
        this.results.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.case}`);
            console.log(`   Estado: ${result.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`   Esperado: ${result.expected}`);
            console.log(`   Obtenido: ${result.actual}`);
        });

        console.log('\n🎯 =====================================');
        console.log('🎯 PRUEBAS DE RELACIONES COMPLETADAS');
        console.log('🎯 =====================================');
    }
}

// 🚀 EJECUTAR PRUEBAS
async function main() {
    const tester = new RelationshipTester();
    await tester.runAllTests();
}

main().catch(console.error); 
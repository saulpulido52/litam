import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../../src/database/entities/user.entity';
import { Role, RoleName } from '../../src/database/entities/role.entity';
import { PatientProfile } from '../../src/database/entities/patient_profile.entity';
import { NutritionistProfile } from '../../src/database/entities/nutritionist_profile.entity';
import { PatientNutritionistRelation } from '../../src/database/entities/patient_nutritionist_relation.entity';
import { Food } from '../../src/database/entities/food.entity';
import { MealItem } from '../../src/database/entities/meal_item.entity';
import { Meal } from '../../src/database/entities/meal.entity';
import { DietPlan } from '../../src/database/entities/diet_plan.entity';
import { Appointment } from '../../src/database/entities/appointment.entity';
import { NutritionistAvailability } from '../../src/database/entities/nutritionist_availability.entity';
import { PatientProgressLog } from '../../src/database/entities/patient_progress_log.entity';
import { SubscriptionPlan } from '../../src/database/entities/subscription_plan.entity';
import { UserSubscription } from '../../src/database/entities/user_subscription.entity';
import { PaymentTransaction } from '../../src/database/entities/payment_transaction.entity';
import { EducationalContent } from '../../src/database/entities/educational_content.entity';
import { Recipe, RecipeIngredient } from '../../src/database/entities/recipe.entity';
import { Conversation } from '../../src/database/entities/conversation.entity';
import { Message } from '../../src/database/entities/message.entity';
import { ClinicalRecord } from '../../src/database/entities/clinical_record.entity';
import bcrypt from 'bcrypt';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    User,
    Role,
    PatientProfile,
    NutritionistProfile,
    PatientNutritionistRelation,
    Food,
    MealItem,
    Meal,
    DietPlan,
    Appointment,
    NutritionistAvailability,
    PatientProgressLog,
    SubscriptionPlan,
    UserSubscription,
    PaymentTransaction,
    EducationalContent,
    Recipe,
    RecipeIngredient,
    Conversation,
    Message,
    ClinicalRecord,
  ],
  synchronize: false,
  logging: true,
});

async function checkAndCreateAdminUsers() {
  try {
    await dataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');

    // Obtener el rol de admin
    const adminRole = await dataSource.getRepository(Role).findOne({
      where: { name: RoleName.ADMIN }
    });

    if (!adminRole) {
      throw new Error('No se pudo encontrar o crear el rol de admin.');
    }

    // Verificar usuarios admin existentes
    const adminUsers = await dataSource.getRepository(User).find({
      where: { role: { name: RoleName.ADMIN } },
      relations: ['role']
    });

    console.log(`\n📊 Usuarios administradores encontrados: ${adminUsers.length}`);

    if (adminUsers.length === 0) {
      console.log('\n🔧 Creando usuarios administradores por defecto...');
      
      // Crear admin principal
      const adminPassword = await bcrypt.hash('nutri123', 10);
      const adminUser = dataSource.getRepository(User).create({
        email: 'nutri.admin@sistema.com',
        password_hash: adminPassword,
        first_name: 'Administrador',
        last_name: 'Sistema',
        phone: '+1234567890',
        role: adminRole || { name: RoleName.ADMIN },
        is_active: true
      });
      await dataSource.getRepository(User).save(adminUser);
      console.log('✅ Usuario admin principal creado: nutri.admin@sistema.com');

      // Crear super admin
      const superAdminPassword = await bcrypt.hash('admin123', 10);
      const superAdminUser = dataSource.getRepository(User).create({
        email: 'admin@nutri.com',
        password_hash: superAdminPassword,
        first_name: 'Super',
        last_name: 'Administrador',
        phone: '+1234567891',
        role: adminRole || { name: RoleName.ADMIN },
        is_active: true
      });
      await dataSource.getRepository(User).save(superAdminUser);
      console.log('✅ Usuario super admin creado: admin@nutri.com');
    } else {
      console.log('\n👥 Usuarios administradores existentes:');
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - ${user.first_name} ${user.last_name}`);
      });
    }

    // Buscar el usuario admin@nutri.com
    const adminEmail = 'admin@nutri.com';
    const adminPasswordPlain = 'admin123';
    const adminPasswordHash = await bcrypt.hash(adminPasswordPlain, 10);
    let adminUser = await dataSource.getRepository(User).findOne({ where: { email: adminEmail }, relations: ['role'] });
    if (adminUser) {
      // Actualizar contraseña y activar
      adminUser.password_hash = adminPasswordHash;
      adminUser.is_active = true;
      adminUser.role = adminRole;
      await dataSource.getRepository(User).save(adminUser);
      console.log('🔄 Usuario admin actualizado:', adminUser.email);
    } else {
      // Crear usuario admin
      adminUser = dataSource.getRepository(User).create({
        email: adminEmail,
        password_hash: adminPasswordHash,
        first_name: 'Super',
        last_name: 'Administrador',
        phone: '+1234567891',
        role: adminRole,
        is_active: true
      });
      await dataSource.getRepository(User).save(adminUser);
      console.log('✅ Usuario admin creado:', adminUser.email);
    }
    // Mostrar datos para verificación
    console.log('\n🔍 Usuario admin actual:');
    console.log({
      email: adminUser.email,
      password_hash: adminUser.password_hash,
      is_active: adminUser.is_active,
      role: adminUser.role?.name
    });

    // Mostrar credenciales de acceso
    console.log('\n🔐 Credenciales de acceso al panel de administración:');
    console.log('📧 Email: nutri.admin@sistema.com');
    console.log('🔑 Contraseña: nutri123');
    console.log('---');
    console.log('📧 Email: admin@nutri.com');
    console.log('🔑 Contraseña: admin123');
    console.log('\n🌐 URL del panel de admin: http://localhost:5173/admin/login');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await dataSource.destroy();
    console.log('\n✅ Conexión cerrada');
  }
}

checkAndCreateAdminUsers(); 
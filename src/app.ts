// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import authRoutes from '@/modules/auth/auth.routes';
import userRoutes from '@/modules/users/users.routes';
import patientRoutes from '@/modules/patients/patient.routes';
import nutritionistRoutes from '@/modules/nutritionists/nutritionist.routes';
import relationRoutes from '@/modules/relations/relation.routes';
import foodRoutes from '@/modules/foods/food.routes';
import dietPlanRoutes from '@/modules/diet_plans/diet_plan.routes';
import appointmentRoutes from '@/modules/appointments/appointment.routes';
import progressTrackingRoutes from '@/modules/progress_tracking/progress_tracking.routes';
import subscriptionRoutes from '@/modules/subscriptions/subscription.routes';
import educationalContentRoutes from '@/modules/educational_content/educational_content.routes';
import adminRoutes from '@/modules/admin/admin.routes';
import messagingRoutes from '@/modules/messaging/message.routes';
import clinicalRecordRoutes from '@/modules/clinical_records/clinical_record.routes'; // Importar rutas de historia clínica
import { AppError } from '@/utils/app.error';

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/nutritionists', nutritionistRoutes);
app.use('/api/relations', relationRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/diet-plans', dietPlanRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/progress-tracking', progressTrackingRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/educational-content', educationalContentRoutes);
app.use('/api/messages', messagingRoutes);
app.use('/api/clinical-records', clinicalRecordRoutes); // Montar rutas de historia clínica

app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`No se puede encontrar ${req.originalUrl} en este servidor!`, 404));
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = 'Algo salió muy mal!';
    let status = 'error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        status = err.status;
    } else {
        console.error('ERROR (No AppError):', err);
    }

    res.status(statusCode).json({
        status: status,
        message: message,
    });
});

export default app;
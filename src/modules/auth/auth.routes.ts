import { Router } from 'express';
import authService from './auth.service';
import { RegisterPatientDto, RegisterNutritionistDto, LoginDto } from './auth.dto';

const router = Router();

// Registro de paciente
router.post('/register/patient', async (req, res, next) => {
    try {
        const dto: RegisterPatientDto = req.body;
        const result = await authService.registerPatient(dto);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

// Registro de nutriólogo
router.post('/register/nutritionist', async (req, res, next) => {
    try {
        const dto: RegisterNutritionistDto = req.body;
        const result = await authService.registerNutritionist(dto);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

// Login
router.post('/login', async (req, res, next) => {
    try {
        const dto: LoginDto = req.body;
        const result = await authService.login(dto);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

export default router;

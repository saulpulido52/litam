# Endpoints API para Aplicación Móvil del Paciente
## Especificaciones Técnicas

### Arquitectura Base

```typescript
// Base URL para endpoints móviles
const BASE_URL = "/api/mobile";

// Estructura de respuesta estándar
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  request_id: string;
}

// Estructura de error estándar
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  request_id: string;
}
```

---

## 1. Autenticación y Sesiones

### POST /api/mobile/auth/login
```typescript
interface LoginRequest {
  email: string;
  password: string;
  device_info: {
    platform: 'ios' | 'android';
    version: string;
    device_id: string;
    push_token?: string;
  };
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'patient';
  };
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  session_id: string;
}

// Validaciones
- email: formato válido, requerido
- password: mínimo 8 caracteres, requerido
- device_info: completo y válido
- Rate limiting: 5 intentos por minuto por IP
```

### POST /api/mobile/auth/refresh
```typescript
interface RefreshRequest {
  refresh_token: string;
}

interface RefreshResponse {
  access_token: string;
  expires_in: number;
}

// Validaciones
- refresh_token: JWT válido y no expirado
- Session activa en base de datos
```

---

## 2. Gestión de Nutriólogos

### GET /api/mobile/nutritionists/available
```typescript
interface AvailableNutritionistsQuery {
  specialty?: string;
  location?: string;
  rating_min?: number;
  price_range?: 'budget' | 'standard' | 'premium';
  availability?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'rating' | 'price' | 'availability' | 'reviews';
  sort_order?: 'asc' | 'desc';
}

interface NutritionistSummary {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  total_reviews: number;
  location: string;
  price_range: string;
  availability: boolean;
  profile_image: string;
  languages: string[];
  is_new: boolean;
  response_time: string; // "Usually responds within 2 hours"
}

// Implementación del Controller
export class MobileNutritionistController {
  async getAvailableNutritionists(req: Request, res: Response) {
    try {
      const query = this.validateQuery(req.query);
      const nutritionists = await this.nutritionistService.findAvailable(query);
      
      const result = {
        nutritionists: nutritionists.data.map(this.mapToSummary),
        pagination: {
          total: nutritionists.total,
          page: query.page,
          limit: query.limit,
          has_next: nutritionists.hasNext,
          has_previous: nutritionists.hasPrevious
        }
      };
      
      res.json(this.formatResponse(result));
    } catch (error) {
      res.status(400).json(this.formatError(error));
    }
  }
}
```

### GET /api/mobile/nutritionists/:id/profile
```typescript
interface NutritionistProfile {
  id: string;
  personal_info: {
    name: string;
    specialty: string;
    experience_years: number;
    education: string[];
    certifications: string[];
    languages: string[];
  };
  ratings: {
    average: number;
    total_reviews: number;
    distribution: Record<string, number>;
  };
  availability: {
    schedule: WeeklySchedule;
    next_available: string;
    time_zone: string;
  };
  pricing: {
    consultation_fee: number;
    currency: string;
    payment_methods: string[];
  };
  recent_reviews: Review[];
  specialties: string[];
  approach: string;
  photos: string[];
}

// Validaciones
- id: UUID válido
- Verificar que el nutriólogo esté activo
- Aplicar filtros de privacidad
```

---

## 3. Transferencia de Nutriólogos

### POST /api/mobile/patients/transfer-nutritionist
```typescript
interface TransferRequest {
  current_nutritionist_id: string;
  new_nutritionist_id: string;
  transfer_reason: string;
  transfer_type: 'immediate' | 'scheduled';
  scheduled_date?: string;
  patient_consent: boolean;
  data_transfer_consent: boolean;
  additional_notes?: string;
}

interface TransferResponse {
  transfer_id: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'completed';
  estimated_completion: string;
  steps: TransferStep[];
  notifications: {
    patient: string[];
    current_nutritionist: string[];
    new_nutritionist: string[];
  };
}

// Implementación del Service
export class PatientTransferService {
  async initiateTransfer(patientId: string, request: TransferRequest) {
    const transaction = await this.dataSource.transaction();
    
    try {
      // 1. Validar relación actual
      const currentRelation = await this.validateCurrentRelation(
        patientId, 
        request.current_nutritionist_id
      );
      
      // 2. Validar disponibilidad del nuevo nutriólogo
      const newNutritionist = await this.validateNewNutritionist(
        request.new_nutritionist_id
      );
      
      // 3. Crear solicitud de transferencia
      const transfer = await this.createTransferRequest(request, transaction);
      
      // 4. Enviar notificación al nuevo nutriólogo
      await this.notificationService.sendTransferRequest(
        request.new_nutritionist_id,
        transfer
      );
      
      // 5. Programar recordatorios
      await this.scheduleReminders(transfer);
      
      await transaction.commit();
      return this.formatTransferResponse(transfer);
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

// Validaciones
- current_nutritionist_id: debe ser el nutriólogo actual del paciente
- new_nutritionist_id: debe ser un nutriólogo activo y disponible
- transfer_reason: mínimo 10 caracteres, máximo 500
- patient_consent: debe ser true
- data_transfer_consent: debe ser true
- Verificar límites de transferencia (máximo 2 por mes)
```

### GET /api/mobile/patients/transfer-status/:transfer_id
```typescript
interface TransferStatus {
  transfer_id: string;
  status: TransferStatusEnum;
  progress: number; // 0-100
  current_step: string;
  estimated_completion: string;
  steps: TransferStep[];
  messages: TransferMessage[];
  can_cancel: boolean;
}

interface TransferStep {
  step_id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  estimated_duration: string;
}
```

### POST /api/mobile/patients/execute-transfer/:transfer_id
```typescript
// Solo se puede ejecutar si el transfer está aprobado
interface ExecuteTransferResponse {
  transfer_id: string;
  status: 'completed' | 'failed';
  summary: TransferSummary;
  next_steps: string[];
  error_details?: any;
}

interface TransferSummary {
  transferred_data: {
    clinical_records: number;
    diet_plans: number;
    progress_records: number;
    appointments_history: number;
    messages: number;
  };
  previous_nutritionist: {
    id: string;
    name: string;
    notified: boolean;
    final_rating?: number;
  };
  new_nutritionist: {
    id: string;
    name: string;
    notified: boolean;
    welcome_message?: string;
  };
  transfer_time: string;
  data_integrity_check: boolean;
}

// Implementación basada en el script validado
export class TransferExecutionService {
  async executeTransfer(transferId: string) {
    const transfer = await this.getTransferById(transferId);
    
    if (transfer.status !== 'approved') {
      throw new Error('Transfer must be approved before execution');
    }
    
    return await this.executeTransferSteps(transfer);
  }
  
  private async executeTransferSteps(transfer: Transfer) {
    // Usar la lógica del script test-transferencia-completa.ts
    const steps = [
      () => this.deactivateCurrentRelation(transfer),
      () => this.transferClinicalRecords(transfer),
      () => this.transferDietPlans(transfer),
      () => this.transferProgressRecords(transfer),
      () => this.createNewRelation(transfer),
      () => this.sendNotifications(transfer),
      () => this.verifyDataIntegrity(transfer)
    ];
    
    for (const step of steps) {
      await step();
    }
    
    return this.generateTransferSummary(transfer);
  }
}
```

---

## 4. Gestión de Relaciones

### GET /api/mobile/patients/current-nutritionist
```typescript
interface CurrentNutritionistResponse {
  nutritionist: {
    id: string;
    name: string;
    specialty: string;
    profile_image: string;
    relationship_since: string;
    total_appointments: number;
    last_appointment: string;
    next_appointment?: string;
    contact_info: {
      phone: string;
      email: string;
      office_address?: string;
    };
  };
  relationship_status: 'active' | 'inactive' | 'pending';
  satisfaction_rating?: number;
  can_transfer: boolean;
  transfer_cooldown?: string;
  recent_activity: Activity[];
}

interface Activity {
  type: 'appointment' | 'diet_plan' | 'message' | 'progress_update';
  description: string;
  date: string;
  important: boolean;
}
```

### POST /api/mobile/patients/end-relationship
```typescript
interface EndRelationshipRequest {
  nutritionist_id: string;
  reason: string;
  rating: number; // 1-5
  review: string;
  data_retention: 'transfer_to_new' | 'keep_with_current' | 'delete_after_30_days';
  feedback_categories?: string[];
}

interface EndRelationshipResponse {
  relationship_id: string;
  ended_at: string;
  data_retention_policy: string;
  next_steps: string[];
  suggested_nutritionists: NutritionistSummary[];
}

// Validaciones
- rating: 1-5 entero
- review: mínimo 20 caracteres si rating < 4
- reason: requerido, máximo 500 caracteres
- Verificar que la relación esté activa
```

---

## 5. Notificaciones y Comunicación

### GET /api/mobile/notifications
```typescript
interface NotificationQuery {
  type?: 'transfer' | 'appointment' | 'diet_plan' | 'message' | 'system';
  status?: 'unread' | 'read' | 'archived';
  limit?: number;
  offset?: number;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
  expires_at?: string;
  action_url?: string;
  action_label?: string;
}
```

### POST /api/mobile/notifications/:id/mark-read
```typescript
interface MarkReadResponse {
  notification_id: string;
  read: boolean;
  read_at: string;
}
```

---

## 6. Middleware y Validaciones

### Middleware de Autenticación
```typescript
export const mobileAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Token required' }
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    const user = await User.findOne({ 
      where: { id: decoded.userId },
      relations: ['role']
    });
    
    if (!user || user.role.name !== 'patient') {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid user or role' }
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid token' }
    });
  }
};
```

### Validaciones de Transferencia
```typescript
export class TransferValidator {
  static validateTransferRequest(request: TransferRequest): ValidationResult {
    const errors: string[] = [];
    
    // Validar IDs
    if (!isUUID(request.current_nutritionist_id)) {
      errors.push('Invalid current nutritionist ID');
    }
    
    if (!isUUID(request.new_nutritionist_id)) {
      errors.push('Invalid new nutritionist ID');
    }
    
    // Validar razón
    if (!request.transfer_reason || request.transfer_reason.length < 10) {
      errors.push('Transfer reason must be at least 10 characters');
    }
    
    // Validar consentimientos
    if (!request.patient_consent || !request.data_transfer_consent) {
      errors.push('Patient consent and data transfer consent are required');
    }
    
    // Validar fecha programada
    if (request.transfer_type === 'scheduled' && !request.scheduled_date) {
      errors.push('Scheduled date is required for scheduled transfers');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static async validateTransferEligibility(patientId: string): Promise<ValidationResult> {
    const recentTransfers = await Transfer.count({
      where: {
        patient_id: patientId,
        created_at: MoreThan(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // 30 días
      }
    });
    
    if (recentTransfers >= 2) {
      return {
        isValid: false,
        errors: ['Maximum 2 transfers per month allowed']
      };
    }
    
    return { isValid: true, errors: [] };
  }
}
```

---

## 7. Testing y Documentación

### Test de Endpoints
```typescript
describe('Mobile Patient API', () => {
  let app: Express;
  let patientToken: string;
  
  beforeAll(async () => {
    app = await createTestApp();
    patientToken = await getPatientToken('patient@demo.com');
  });
  
  describe('GET /api/mobile/nutritionists/available', () => {
    it('should return available nutritionists', async () => {
      const response = await request(app)
        .get('/api/mobile/nutritionists/available')
        .set('Authorization', `Bearer ${patientToken}`)
        .query({ specialty: 'sports_nutrition' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nutritionists).toBeInstanceOf(Array);
    });
  });
  
  describe('POST /api/mobile/patients/transfer-nutritionist', () => {
    it('should initiate transfer request', async () => {
      const transferRequest = {
        current_nutritionist_id: 'current-id',
        new_nutritionist_id: 'new-id',
        transfer_reason: 'Looking for sports nutrition specialist',
        transfer_type: 'immediate',
        patient_consent: true,
        data_transfer_consent: true
      };
      
      const response = await request(app)
        .post('/api/mobile/patients/transfer-nutritionist')
        .set('Authorization', `Bearer ${patientToken}`)
        .send(transferRequest);
      
      expect(response.status).toBe(201);
      expect(response.body.data.transfer_id).toBeDefined();
    });
  });
});
```

### Documentación OpenAPI
```yaml
openapi: 3.0.0
info:
  title: Nutri Mobile Patient API
  version: 1.0.0
  description: API endpoints for mobile patient application

paths:
  /api/mobile/nutritionists/available:
    get:
      tags:
        - Nutritionists
      summary: Get available nutritionists
      parameters:
        - name: specialty
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of available nutritionists
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: object
                    properties:
                      nutritionists:
                        type: array
                        items:
                          $ref: '#/components/schemas/NutritionistSummary'
```

---

## 8. Consideraciones de Seguridad

### Rate Limiting
```typescript
const transferRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 2, // máximo 2 transferencias por día
  message: 'Too many transfer requests, please try again later',
  keyGenerator: (req) => req.user.id
});

app.use('/api/mobile/patients/transfer-nutritionist', transferRateLimit);
```

### Logging y Auditoría
```typescript
export class TransferAuditLogger {
  static async logTransferAttempt(patientId: string, request: TransferRequest) {
    await AuditLog.create({
      user_id: patientId,
      action: 'TRANSFER_ATTEMPT',
      resource: 'patient_transfer',
      details: {
        current_nutritionist: request.current_nutritionist_id,
        new_nutritionist: request.new_nutritionist_id,
        reason: request.transfer_reason,
        type: request.transfer_type
      },
      ip_address: request.ip,
      user_agent: request.get('User-Agent')
    });
  }
}
```

---

## Conclusión

Esta especificación técnica proporciona la base completa para implementar los endpoints API necesarios para la aplicación móvil del paciente. Todos los endpoints están diseñados para:

- **Seguridad**: Autenticación JWT, validaciones robustas, rate limiting
- **Escalabilidad**: Paginación, filtros eficientes, caching
- **Integridad**: Transacciones, validaciones de negocio, auditoría
- **UX**: Respuestas optimizadas, notificaciones push, estado en tiempo real

La implementación se basa en el prototipo validado (`test-transferencia-completa.ts`) y garantiza una experiencia fluida para la transferencia automática de nutriólogos. 
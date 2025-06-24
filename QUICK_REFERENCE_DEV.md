# ⚡ **QUICK REFERENCE - DESARROLLO RÁPIDO**

> **Guía de referencia rápida para desarrollo del sistema nutricional**  
> **Uso**: Comandos frecuentes, endpoints, debugging, configuración

---

## 🚀 **COMANDOS RÁPIDOS**

### **Backend Commands**
```bash
# Desarrollo
npm start                    # Start backend dev server
npm run build               # Build TypeScript
npm run dev                 # Nodemon development

# Database
npm run db:migrate          # Run migrations
npm run db:seed            # Seed test data
npm run db:drop            # Drop database

# Testing
npm test                   # Run tests
npm run test:watch         # Watch mode tests
```

### **Frontend Commands**
```bash
# Desarrollo
cd nutri-web && npm run dev    # Start frontend (Vite)
npm run build                  # Build production
npm run preview                # Preview build

# Dependencies
npm install                    # Install dependencies
npm audit fix                  # Fix vulnerabilities
```

### **System Commands**
```powershell
# Windows PowerShell específicos
netstat -ano | findstr :4000     # Check port 4000
netstat -ano | findstr :5000     # Check port 5000
taskkill /PID [PID] /F            # Kill process

# Development flow
.\start-app.ps1                   # Start full system
.\stop-app.ps1                    # Stop all services
.\check-backend.ps1               # Health check
```

---

## 🔌 **ENDPOINTS PRINCIPALES**

### **Authentication**
```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/refresh
```

### **Patients Management**
```http
GET    /api/patients/my-patients         # List nutritionist patients
POST   /api/patients/create-by-nutritionist  # Create patient
PUT    /api/patients/:id                 # Update patient
PUT    /api/patients/by-email/:email     # Update by email
DELETE /api/patients/:id/relationship    # Remove from list (nutritionist)
DELETE /api/patients/:id/account         # Delete account (admin)
GET    /api/patients/check-email?email=  # Check email availability
```

### **Clinical Records**
```http
GET    /api/clinical-records/patient/:patientId
POST   /api/clinical-records
PUT    /api/clinical-records/:id
DELETE /api/clinical-records/:id
```

### **Relations**
```http
GET    /api/relations/nutritionist/:id
POST   /api/relations/request
PUT    /api/relations/:id/accept
DELETE /api/relations/:id
```

---

## 🔧 **CONFIGURACIÓN CRÍTICA**

### **Environment Variables**
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=nutri_dev

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# App
NODE_ENV=development
PORT=4000
```

### **Database Connection**
```typescript
// data-source.ts
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    username: process.env.DATABASE_USERNAME || "postgres",
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || "nutri_dev",
    synchronize: process.env.NODE_ENV === "development",
    logging: process.env.NODE_ENV === "development",
    entities: ["src/database/entities/*.ts"],
    migrations: ["src/database/migrations/*.ts"],
});
```

---

## 🐛 **DEBUGGING COMÚN**

### **JWT Token Issues**
```typescript
// ❌ Error común
const token = localStorage.getItem('token');

// ✅ Solución
const token = localStorage.getItem('access_token');

// Debugging tokens
console.log('Token:', token);
console.log('Token length:', token?.length);
console.log('Token valid JWT:', token?.split('.').length === 3);
```

### **Database Connection Issues**
```bash
# Check PostgreSQL status
pg_ctl status -D /path/to/data

# Test connection
psql -h localhost -p 5432 -U postgres -d nutri_dev

# Common fixes
lsof -i :5432              # Check port usage
brew services restart postgresql  # Restart PostgreSQL (Mac)
```

### **Frontend API Issues**
```typescript
// Debug API calls
console.log('API Base URL:', import.meta.env.VITE_API_URL);
console.log('Request config:', config);
console.log('Response:', response);

// Check network tab in DevTools
// Verify CORS settings
// Check token in request headers
```

---

## 📊 **DATABASE QUERIES ÚTILES**

### **Patient Relations**
```sql
-- Check active relationships
SELECT r.*, p.first_name, p.last_name, n.first_name as nutritionist_name
FROM patient_nutritionist_relations r
JOIN users p ON p.id = r.patient_user_id
JOIN users n ON n.id = r.nutritionist_user_id
WHERE r.status = 'active';

-- Count patients per nutritionist
SELECT n.first_name, n.last_name, COUNT(r.id) as patient_count
FROM users n
LEFT JOIN patient_nutritionist_relations r ON r.nutritionist_user_id = n.id AND r.status = 'active'
JOIN roles ro ON ro.id = n.role_id
WHERE ro.name = 'nutritionist'
GROUP BY n.id, n.first_name, n.last_name;
```

### **User Management**
```sql
-- Find user by email
SELECT u.*, r.name as role_name 
FROM users u 
JOIN roles r ON r.id = u.role_id 
WHERE u.email = 'nutritionist@demo.com';

-- Check patient profiles
SELECT u.first_name, u.last_name, u.email, pp.current_weight, pp.height
FROM users u
LEFT JOIN patient_profiles pp ON pp.user_id = u.id
JOIN roles r ON r.id = u.role_id
WHERE r.name = 'patient';
```

---

## 🎨 **FRONTEND COMPONENTS**

### **API Service Usage**
```typescript
// Import API service
import { patientsService } from '../services/patientsService';

// Common patterns
const patients = await patientsService.getMyPatients();
const emailCheck = await patientsService.checkEmailExists(email);
await patientsService.removePatientFromList(patientId);
```

### **React Hooks Usage**
```typescript
// usePatients hook
import { usePatients } from '../hooks/usePatients';

const { 
  patients, 
  loading, 
  error, 
  deletePatient, 
  removePatient,
  loadPatients 
} = usePatients();
```

### **Error Handling Pattern**
```typescript
try {
  const result = await apiCall();
  // Success handling
} catch (error: any) {
  if (error.message.includes('Token inválido')) {
    // Redirect to login
    navigate('/login');
  } else if (error.message.includes('No se encontró una relación activa')) {
    // Refresh data
    await loadPatients();
  } else {
    // Generic error
    setError(error.message);
  }
}
```

---

## 🔍 **TESTING & VALIDATION**

### **Manual Testing Checklist**
```markdown
Authentication:
- [ ] Login with nutritionist@demo.com
- [ ] Token persistence after page refresh
- [ ] Logout functionality
- [ ] Protected routes redirect

Patient Management:
- [ ] Load patient list (should show 7 patients)
- [ ] Email verification (try saulpulido52@gmail.com)
- [ ] Create new patient with birth date
- [ ] Remove patient from list
- [ ] Update patient information

Error Handling:
- [ ] Network errors handled gracefully
- [ ] Invalid token redirects to login
- [ ] Form validation working
- [ ] Loading states shown
```

### **API Testing with curl**
```bash
# Login and get token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nutritionist@demo.com","password":"password123"}'

# Use token for authenticated requests
curl -X GET http://localhost:4000/api/patients/my-patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Check email availability
curl -X GET "http://localhost:4000/api/patients/check-email?email=test@example.com" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🚨 **EMERGENCY PROCEDURES**

### **System Down**
1. Check if backend is running: `curl http://localhost:4000/api/health`
2. Check if database is accessible: `psql -h localhost -p 5432 -U postgres -d nutri_dev`
3. Check frontend: `curl http://localhost:5000`
4. Restart services: `.\stop-app.ps1 && .\start-app.ps1`

### **Database Issues**
1. Check PostgreSQL status
2. Restart PostgreSQL service
3. Check database connections: `SELECT * FROM pg_stat_activity;`
4. Drop and recreate database if needed

### **Token Issues**
1. Clear localStorage: `localStorage.clear()`
2. Check JWT_SECRET in .env
3. Verify token format in network tab
4. Check middleware implementation

---

## 📱 **PORT REFERENCE**

```
Backend:     4000  (http://localhost:4000)
Frontend:    5000  (http://localhost:5000) or 5001 if 5000 busy
Database:    5432  (PostgreSQL default)
WebSocket:   4000  (Socket.IO on same port as backend)
```

---

## 🔑 **USER CREDENTIALS**

### **Demo Users**
```
Nutritionist:
  Email: nutritionist@demo.com
  Password: password123
  Role: nutritionist
  ID: dd58261c-a7aa-461f-a45d-4028dca0145a

Test Patients:
  Email: saulpulido52@gmail.com (already registered)
  Email: marcy.soto@uabc.edu.mx (already registered)
  Various test patients with different profiles
```

---

## 📋 **COMMON ISSUES & SOLUTIONS**

| Issue | Symptoms | Solution |
|-------|----------|----------|
| JWT Malformed | 401 errors, token invalid | Check localStorage key (`access_token`) |
| EADDRINUSE | Port already in use | Kill process: `taskkill /PID [PID] /F` |
| Database Connection | Can't connect to database | Check PostgreSQL service, credentials |
| Stale Data | Frontend shows old data | Clear cache, implement auto-refresh |
| CORS Errors | Blocked by CORS policy | Check backend CORS configuration |
| TypeScript Errors | Build fails | Check types, imports, dependencies |

---

*Referencia rápida actualizada | Versión: 1.2.0 | Última actualización: 23 Dic 2025* 
// nutri-web/src/pages/auth/NutritionistRegistration.tsx
import React, { useState } from 'react';
import { 
    Container, 
    Row, 
    Col, 
    Card, 
    Button,
    Form,
    Alert,
    ProgressBar,
    Spinner,
    InputGroup,
    Badge} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
    MdSchool, 
    MdVerifiedUser,
    MdDescription,
    MdUpload,
    MdLocationOn,
    MdEmail
} from 'react-icons/md';
import axios from 'axios';

interface FormData {
    // Información personal
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    birth_date: string;
    gender: string;
    
    // Validación profesional
    professional_id: string;
    professional_id_issuer: string;
    university: string;
    degree_title: string;
    graduation_date: string;
    rfc: string;
    curp: string;
    
    // Información profesional
    license_number: string;
    license_issuing_authority: string;
    specialties: string[];
    years_of_experience: number;
    education: string[];
    certifications: string[];
    areas_of_interest: string[];
    
    // Práctica profesional
    bio: string;
    professional_summary: string;
    treatment_approach: string;
    languages: string[];
    consultation_fee: number;
    
    // Modalidades
    offers_in_person: boolean;
    offers_online: boolean;
    
    // Consultorio
    clinic_name: string;
    clinic_address: string;
    clinic_city: string;
    clinic_state: string;
    clinic_zip_code: string;
    clinic_country: string;
    clinic_phone: string;
}

const initialFormData: FormData = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: '',
    professional_id: '',
    professional_id_issuer: '',
    university: '',
    degree_title: '',
    graduation_date: '',
    rfc: '',
    curp: '',
    license_number: '',
    license_issuing_authority: '',
    specialties: [],
    years_of_experience: 0,
    education: [''],
    certifications: [],
    areas_of_interest: [],
    bio: '',
    professional_summary: '',
    treatment_approach: '',
    languages: ['Español'],
    consultation_fee: 0,
    offers_in_person: true,
    offers_online: true,
    clinic_name: '',
    clinic_address: '',
    clinic_city: '',
    clinic_state: '',
    clinic_zip_code: '',
    clinic_country: 'México',
    clinic_phone: ''
};

const specialtyOptions = [
    'Nutrición Clínica',
    'Nutrición Deportiva',
    'Nutrición Pediátrica',
    'Nutrición Geriátrica',
    'Obesidad y Sobrepeso',
    'Diabetes',
    'Trastornos Alimentarios',
    'Nutrición Vegetariana/Vegana',
    'Nutrición Funcional',
    'Nutrición Hospitalaria'
];

const NutritionistRegistration: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const totalSteps = 5;
    const progressPercentage = (currentStep / totalSteps) * 100;

    const handleInputChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleArrayInputChange = (field: keyof FormData, index: number, value: string) => {
        const currentArray = formData[field] as string[];
        const newArray = [...currentArray];
        newArray[index] = value;
        handleInputChange(field, newArray);
    };

    const addArrayItem = (field: keyof FormData) => {
        const currentArray = formData[field] as string[];
        handleInputChange(field, [...currentArray, '']);
    };

    const removeArrayItem = (field: keyof FormData, index: number) => {
        const currentArray = formData[field] as string[];
        const newArray = currentArray.filter((_, i) => i !== index);
        handleInputChange(field, newArray);
    };

    const handleSpecialtyToggle = (specialty: string) => {
        const currentSpecialties = formData.specialties;
        if (currentSpecialties.includes(specialty)) {
            handleInputChange('specialties', currentSpecialties.filter(s => s !== specialty));
        } else {
            handleInputChange('specialties', [...currentSpecialties, specialty]);
        }
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1: // Información personal
                if (!formData.first_name.trim()) newErrors.first_name = 'El nombre es requerido';
                if (!formData.last_name.trim()) newErrors.last_name = 'El apellido es requerido';
                if (!formData.email.trim()) newErrors.email = 'El email es requerido';
                else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
                if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
                if (!formData.birth_date) newErrors.birth_date = 'La fecha de nacimiento es requerida';
                if (!formData.gender) newErrors.gender = 'El género es requerido';
                break;

            case 2: // Validación profesional
                if (!formData.professional_id.trim()) newErrors.professional_id = 'La cédula profesional es requerida';
                else if (!/^[0-9]{7,10}$/.test(formData.professional_id)) newErrors.professional_id = 'La cédula debe tener entre 7 y 10 dígitos';
                if (!formData.professional_id_issuer.trim()) newErrors.professional_id_issuer = 'La entidad emisora es requerida';
                if (!formData.university.trim()) newErrors.university = 'La universidad es requerida';
                if (!formData.degree_title.trim()) newErrors.degree_title = 'El título es requerido';
                if (!formData.graduation_date) newErrors.graduation_date = 'La fecha de graduación es requerida';
                if (!formData.rfc.trim()) newErrors.rfc = 'El RFC es requerido';
                else if (!/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(formData.rfc)) newErrors.rfc = 'RFC inválido';
                if (!formData.curp.trim()) newErrors.curp = 'El CURP es requerido';
                else if (!/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/.test(formData.curp)) newErrors.curp = 'CURP inválido';
                break;

            case 3: // Información profesional
                if (formData.specialties.length === 0) newErrors.specialties = 'Debe seleccionar al menos una especialidad';
                if (formData.years_of_experience < 0) newErrors.years_of_experience = 'Los años de experiencia no pueden ser negativos';
                if (formData.education.filter(e => e.trim()).length === 0) newErrors.education = 'Debe agregar al menos una entrada de educación';
                break;

            case 4: // Práctica profesional
                if (!formData.bio.trim()) newErrors.bio = 'La biografía profesional es requerida';
                else if (formData.bio.length < 50) newErrors.bio = 'La biografía debe tener al menos 50 caracteres';
                if (formData.languages.filter(l => l.trim()).length === 0) newErrors.languages = 'Debe especificar al menos un idioma';
                if (formData.consultation_fee < 0) newErrors.consultation_fee = 'La tarifa no puede ser negativa';
                if (!formData.offers_in_person && !formData.offers_online) newErrors.offers_in_person = 'Debe ofrecer al menos una modalidad de consulta';
                break;

            case 5: // Información del consultorio (opcional en su mayoría)
                // La mayoría de campos son opcionales para el consultorio
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setLoading(true);
        try {
            // Preparar datos para envío
            const submitData = {
                ...formData,
                education: formData.education.filter(e => e.trim()),
                certifications: formData.certifications.filter(c => c.trim()),
                areas_of_interest: formData.areas_of_interest.filter(a => a.trim()),
                languages: formData.languages.filter(l => l.trim())
            };

            const response = await axios.post('/api/nutritionists/register', submitData);
            
            setSubmitSuccess(true);
            console.log('Registro exitoso:', response.data);
            
            // Redirigir después de 3 segundos
            setTimeout(() => {
                navigate('/login', { 
                    state: { 
                        message: 'Registro exitoso. Su solicitud está siendo revisada. Recibirá un email cuando sea aprobada.' 
                    } 
                });
            }, 3000);

        } catch (error: any) {
            console.error('Error en registro:', error);
            if (error.response?.data?.errors) {
                const serverErrors: Record<string, string> = {};
                error.response.data.errors.forEach((err: any) => {
                    if (typeof err === 'string') {
                        serverErrors.general = err;
                    } else if (err.property) {
                        serverErrors[err.property] = err.constraints ? Object.values(err.constraints)[0] as string : 'Error de validación';
                    }
                });
                setErrors(serverErrors);
            } else {
                setErrors({ general: error.response?.data?.message || 'Error al registrar nutriólogo' });
            }
        } finally {
            setLoading(false);
        }
    };

    if (submitSuccess) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card className="shadow border-0">
                            <Card.Body className="text-center py-5">
                                <div className="mb-4">
                                    <MdVerifiedUser size={64} className="text-success" />
                                </div>
                                <h3 className="text-success mb-3">¡Registro Exitoso!</h3>
                                <p className="text-muted mb-4">
                                    Su solicitud de registro como nutriólogo ha sido recibida exitosamente. 
                                    Nuestros administradores revisarán su información y documentación.
                                </p>
                                <Alert variant="info">
                                    <strong>Próximos pasos:</strong>
                                    <ol className="mb-0 mt-2">
                                        <li>Recibirá un email de confirmación</li>
                                        <li>Nuestro equipo validará su cédula profesional</li>
                                        <li>Le notificaremos cuando su cuenta sea aprobada</li>
                                    </ol>
                                </Alert>
                                <p className="text-muted small">
                                    Redirigiendo al login en unos segundos...
                                </p>
                                <Spinner animation="border" size="sm" />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div>
                        <h4 className="mb-3">
                            <MdEmail className="me-2" />
                            Información Personal
                        </h4>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                                        isInvalid={!!errors.first_name}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.first_name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Apellido *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                                        isInvalid={!!errors.last_name}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.last_name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                isInvalid={!!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Teléfono *</Form.Label>
                            <Form.Control
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="ej: +52 55 1234 5678"
                                isInvalid={!!errors.phone}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.phone}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de Nacimiento *</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.birth_date}
                                        onChange={(e) => handleInputChange('birth_date', e.target.value)}
                                        isInvalid={!!errors.birth_date}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.birth_date}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Género *</Form.Label>
                                    <Form.Select
                                        value={formData.gender}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                        isInvalid={!!errors.gender}
                                    >
                                        <option value="">Seleccionar género</option>
                                        <option value="male">Masculino</option>
                                        <option value="female">Femenino</option>
                                        <option value="other">Otro</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.gender}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                );

            case 2:
                return (
                    <div>
                        <h4 className="mb-3">
                            <MdVerifiedUser className="me-2" />
                            Validación Profesional
                        </h4>
                        
                        <Alert variant="info" className="mb-4">
                            <strong>Información importante:</strong> Esta información será validada con autoridades oficiales.
                        </Alert>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cédula Profesional *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.professional_id}
                                        onChange={(e) => handleInputChange('professional_id', e.target.value)}
                                        placeholder="ej: 12345678"
                                        isInvalid={!!errors.professional_id}
                                    />
                                    <Form.Text className="text-muted">
                                        Entre 7 y 10 dígitos
                                    </Form.Text>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.professional_id}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Entidad Emisora *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.professional_id_issuer}
                                        onChange={(e) => handleInputChange('professional_id_issuer', e.target.value)}
                                        placeholder="ej: SEP, Universidad Nacional"
                                        isInvalid={!!errors.professional_id_issuer}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.professional_id_issuer}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Universidad *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.university}
                                        onChange={(e) => handleInputChange('university', e.target.value)}
                                        placeholder="ej: Universidad Nacional Autónoma de México"
                                        isInvalid={!!errors.university}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.university}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Título Profesional *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.degree_title}
                                        onChange={(e) => handleInputChange('degree_title', e.target.value)}
                                        placeholder="ej: Licenciado en Nutrición"
                                        isInvalid={!!errors.degree_title}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.degree_title}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Fecha de Graduación *</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.graduation_date}
                                onChange={(e) => handleInputChange('graduation_date', e.target.value)}
                                isInvalid={!!errors.graduation_date}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.graduation_date}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>RFC *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.rfc}
                                        onChange={(e) => handleInputChange('rfc', e.target.value.toUpperCase())}
                                        placeholder="ej: XAXX010101000"
                                        isInvalid={!!errors.rfc}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.rfc}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>CURP *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.curp}
                                        onChange={(e) => handleInputChange('curp', e.target.value.toUpperCase())}
                                        placeholder="ej: XAXX010101HDFXXX00"
                                        isInvalid={!!errors.curp}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.curp}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                );

            case 3:
                return (
                    <div>
                        <h4 className="mb-3">
                            <MdSchool className="me-2" />
                            Información Profesional
                        </h4>

                        <Form.Group className="mb-4">
                            <Form.Label>Especialidades *</Form.Label>
                            <div className="mt-2">
                                {specialtyOptions.map((specialty) => (
                                    <Badge
                                        key={specialty}
                                        bg={formData.specialties.includes(specialty) ? 'primary' : 'outline-secondary'}
                                        className="me-2 mb-2 p-2 cursor-pointer"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleSpecialtyToggle(specialty)}
                                    >
                                        {specialty}
                                    </Badge>
                                ))}
                            </div>
                            {errors.specialties && (
                                <div className="text-danger small mt-1">{errors.specialties}</div>
                            )}
                            <Form.Text className="text-muted">
                                Seleccione sus especialidades haciendo clic en ellas
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Años de Experiencia *</Form.Label>
                            <Form.Control
                                type="number"
                                min="0"
                                value={formData.years_of_experience}
                                onChange={(e) => handleInputChange('years_of_experience', parseInt(e.target.value) || 0)}
                                isInvalid={!!errors.years_of_experience}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.years_of_experience}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Educación *</Form.Label>
                            {formData.education.map((edu, index) => (
                                <div key={index} className="d-flex mb-2">
                                    <Form.Control
                                        type="text"
                                        value={edu}
                                        onChange={(e) => handleArrayInputChange('education', index, e.target.value)}
                                        placeholder="ej: Licenciatura en Nutrición - UNAM (2020)"
                                    />
                                    {formData.education.length > 1 && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="ms-2"
                                            onClick={() => removeArrayItem('education', index)}
                                        >
                                            ×
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => addArrayItem('education')}
                            >
                                + Agregar Educación
                            </Button>
                            {errors.education && (
                                <div className="text-danger small mt-1">{errors.education}</div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Certificaciones (Opcional)</Form.Label>
                            {formData.certifications.map((cert, index) => (
                                <div key={index} className="d-flex mb-2">
                                    <Form.Control
                                        type="text"
                                        value={cert}
                                        onChange={(e) => handleArrayInputChange('certifications', index, e.target.value)}
                                        placeholder="ej: Certificación en Nutrición Deportiva - ISSN"
                                    />
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="ms-2"
                                        onClick={() => removeArrayItem('certifications', index)}
                                    >
                                        ×
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => addArrayItem('certifications')}
                            >
                                + Agregar Certificación
                            </Button>
                        </Form.Group>
                    </div>
                );

            case 4:
                return (
                    <div>
                        <h4 className="mb-3">
                            <MdDescription className="me-2" />
                            Práctica Profesional
                        </h4>

                        <Form.Group className="mb-3">
                            <Form.Label>Biografía Profesional *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                placeholder="Describe tu experiencia profesional, enfoque de trabajo y filosofía nutricional..."
                                isInvalid={!!errors.bio}
                            />
                            <Form.Text className="text-muted">
                                Mínimo 50 caracteres. {formData.bio.length}/1000
                            </Form.Text>
                            <Form.Control.Feedback type="invalid">
                                {errors.bio}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Resumen Profesional (Opcional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.professional_summary}
                                onChange={(e) => handleInputChange('professional_summary', e.target.value)}
                                placeholder="Breve descripción para mostrar a pacientes potenciales..."
                                maxLength={300}
                            />
                            <Form.Text className="text-muted">
                                {formData.professional_summary.length}/300
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Idiomas *</Form.Label>
                            {formData.languages.map((lang, index) => (
                                <div key={index} className="d-flex mb-2">
                                    <Form.Control
                                        type="text"
                                        value={lang}
                                        onChange={(e) => handleArrayInputChange('languages', index, e.target.value)}
                                        placeholder="ej: Español"
                                    />
                                    {formData.languages.length > 1 && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="ms-2"
                                            onClick={() => removeArrayItem('languages', index)}
                                        >
                                            ×
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => addArrayItem('languages')}
                            >
                                + Agregar Idioma
                            </Button>
                            {errors.languages && (
                                <div className="text-danger small mt-1">{errors.languages}</div>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Tarifa por Consulta (MXN) *</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>$</InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={formData.consultation_fee}
                                    onChange={(e) => handleInputChange('consultation_fee', parseFloat(e.target.value) || 0)}
                                    isInvalid={!!errors.consultation_fee}
                                />
                                <InputGroup.Text>MXN</InputGroup.Text>
                            </InputGroup>
                            <Form.Control.Feedback type="invalid">
                                {errors.consultation_fee}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Modalidades de Consulta *</Form.Label>
                            <div className="mt-2">
                                <Form.Check
                                    type="checkbox"
                                    label="Consultas Presenciales"
                                    checked={formData.offers_in_person}
                                    onChange={(e) => handleInputChange('offers_in_person', e.target.checked)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="Consultas Online"
                                    checked={formData.offers_online}
                                    onChange={(e) => handleInputChange('offers_online', e.target.checked)}
                                />
                            </div>
                            {errors.offers_in_person && (
                                <div className="text-danger small mt-1">{errors.offers_in_person}</div>
                            )}
                        </Form.Group>
                    </div>
                );

            case 5:
                return (
                    <div>
                        <h4 className="mb-3">
                            <MdLocationOn className="me-2" />
                            Información del Consultorio
                        </h4>

                        <Alert variant="info" className="mb-4">
                            Esta información es opcional, pero ayudará a los pacientes a encontrarte.
                        </Alert>

                        <Form.Group className="mb-3">
                            <Form.Label>Nombre del Consultorio</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.clinic_name}
                                onChange={(e) => handleInputChange('clinic_name', e.target.value)}
                                placeholder="ej: Consultorio Nutricional Dr. Pérez"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Dirección</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.clinic_address}
                                onChange={(e) => handleInputChange('clinic_address', e.target.value)}
                                placeholder="ej: Av. Insurgentes Sur 1234, Col. Del Valle"
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Ciudad</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.clinic_city}
                                        onChange={(e) => handleInputChange('clinic_city', e.target.value)}
                                        placeholder="ej: Ciudad de México"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Estado</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.clinic_state}
                                        onChange={(e) => handleInputChange('clinic_state', e.target.value)}
                                        placeholder="ej: CDMX"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Código Postal</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.clinic_zip_code}
                                        onChange={(e) => handleInputChange('clinic_zip_code', e.target.value)}
                                        placeholder="ej: 03100"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Teléfono del Consultorio</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={formData.clinic_phone}
                                        onChange={(e) => handleInputChange('clinic_phone', e.target.value)}
                                        placeholder="ej: +52 55 1234 5678"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card className="shadow border-0">
                        <Card.Header className="bg-primary text-white">
                            <Row className="align-items-center">
                                <Col>
                                    <h3 className="mb-0">
                                        <MdVerifiedUser className="me-2" />
                                        Registro de Nutriólogo Profesional
                                    </h3>
                                    <small>Únete a la plataforma Litam como profesional certificado</small>
                                </Col>
                            </Row>
                        </Card.Header>
                        
                        <Card.Body>
                            {/* Barra de progreso */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <small className="text-muted">Paso {currentStep} de {totalSteps}</small>
                                    <small className="text-muted">{Math.round(progressPercentage)}% completado</small>
                                </div>
                                <ProgressBar now={progressPercentage} variant="primary" />
                            </div>

                            {/* Errores generales */}
                            {errors.general && (
                                <Alert variant="danger" className="mb-4">
                                    {errors.general}
                                </Alert>
                            )}

                            {/* Contenido del paso actual */}
                            {renderStep()}
                        </Card.Body>

                        <Card.Footer className="bg-light">
                            <div className="d-flex justify-content-between">
                                <Button
                                    variant="outline-secondary"
                                    onClick={handlePrevious}
                                    disabled={currentStep === 1}
                                >
                                    Anterior
                                </Button>

                                <div>
                                    {currentStep < totalSteps ? (
                                        <Button
                                            variant="primary"
                                            onClick={handleNext}
                                        >
                                            Siguiente
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="success"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Registrando...
                                                </>
                                            ) : (
                                                <>
                                                    <MdUpload className="me-2" />
                                                    Completar Registro
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="text-center mt-3">
                                <small className="text-muted">
                                    ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
                                </small>
                            </div>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default NutritionistRegistration;
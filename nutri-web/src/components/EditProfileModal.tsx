import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Tab, Nav, Spinner, Alert } from 'react-bootstrap';
import { User, MapPin, Clock, Lock, Shield } from 'lucide-react';
import type { ProfileData } from '../services/profileService';
import profileService from '../services/profileService';

interface EditProfileModalProps {
    show: boolean;
    onHide: () => void;
    profile: ProfileData | null;
    platformStats?: any;
    onSave: (data: Partial<ProfileData>) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    show,
    onHide,
    profile,
    onSave
}) => {
    // Initialize with default empty strings to avoid "uncontrolled to controlled" warning
    const [formData, setFormData] = useState<Partial<ProfileData>>({
        first_name: '',
        last_name: '',
        phone: '',
        bio: '',
        specialties: [],
        years_of_experience: 0,
        license_number: '',
        clinic_name: '',
        clinic_address: '',
        clinic_city: '',
        clinic_state: '',
        clinic_phone: '',
        offers_in_person: true,
        offers_online: true,
        certifications: [],
        consultation_fee: 0
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Load profile data into form when modal opens
    useEffect(() => {
        if (profile && show) {
            const nutritionist = profile.nutritionist_profile || {};
            setFormData({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                phone: profile.phone || '',

                // Professional
                bio: nutritionist.bio || profile.bio || '',
                specialties: nutritionist.specialties || profile.specialties || [],
                years_of_experience: nutritionist.years_of_experience || profile.years_of_experience || 0,
                license_number: nutritionist.license_number || profile.license_number || '',

                // Clinic
                clinic_name: nutritionist.clinic_name || profile.clinic_name || '',
                clinic_address: nutritionist.clinic_address || profile.clinic_address || '',
                clinic_city: nutritionist.clinic_city || profile.clinic_city || '',
                clinic_state: nutritionist.clinic_state || profile.clinic_state || '',
                clinic_phone: nutritionist.clinic_phone || profile.clinic_phone || '',
                consultation_fee: nutritionist.consultation_fee || profile.consultation_fee || 0,

                // Certifications
                certifications: nutritionist.certifications || profile.certifications || [],

                // Availability
                offers_in_person: nutritionist.offers_in_person !== undefined ? nutritionist.offers_in_person : true,
                offers_online: nutritionist.offers_online !== undefined ? nutritionist.offers_online : true,
            });
            setError(null);
            setSuccessMessage(null);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
    }, [profile, show]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSpecialtiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Just store the raw value - we'll split it when submitting
        setFormData(prev => ({
            ...prev,
            specialties: [e.target.value] // Store as single-item array with raw string
        }));
    }

    const handleCertificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Just store the raw value - we'll split it when submitting
        setFormData(prev => ({
            ...prev,
            certifications: [e.target.value] // Store as single-item array with raw string
        }));
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.first_name || !formData.last_name) {
            setError('El nombre y apellidos son obligatorios.');
            return false;
        }
        return true;
    };

    const handleSubmitProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Process comma-separated strings into arrays before submitting
            const processedData = {
                ...formData,
                specialties: Array.isArray(formData.specialties) && formData.specialties.length === 1 && typeof formData.specialties[0] === 'string'
                    ? formData.specialties[0].split(',').map(s => s.trim()).filter(s => s.length > 0)
                    : formData.specialties,
                certifications: Array.isArray(formData.certifications) && formData.certifications.length === 1 && typeof formData.certifications[0] === 'string'
                    ? formData.certifications[0].split(',').map(s => s.trim()).filter(s => s.length > 0)
                    : formData.certifications
            };

            await onSave(processedData);
            setSuccessMessage('Perfil actualizado exitosamente');
            setTimeout(onHide, 1500); // Close after brief success msg
        } catch (err: any) {
            console.error("Error saving profile:", err);
            setError('Error al guardar el perfil. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPassword = async () => {
        setError(null);
        setSuccessMessage(null);

        if (!passwordData.currentPassword || !passwordData.newPassword) {
            setError('Debes ingresar la contraseña actual y la nueva.');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Las nuevas contraseñas no coinciden.');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            await profileService.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSuccessMessage('Contraseña actualizada correctamente.');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            console.error("Error changing password:", err);
            setError(err.response?.data?.message || 'Error al actualizar la contraseña. Verifica tu contraseña actual.');
        } finally {
            setLoading(false);
        }
    };

    const getSpecialtiesString = () => {
        const specs = formData.specialties;
        if (Array.isArray(specs)) return specs.join(', ');
        return '';
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="profile-edit-modal">
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold">Editar Perfil Profesional</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Global Messages */}
                {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
                {successMessage && <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible>{successMessage}</Alert>}

                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'general')}>
                    <Row>
                        <Col sm={3}>
                            <Nav variant="pills" className="flex-column mb-3">
                                <Nav.Item>
                                    <Nav.Link eventKey="general" className="d-flex align-items-center gap-2">
                                        <User size={18} /> General
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="clinic" className="d-flex align-items-center gap-2">
                                        <MapPin size={18} /> Consultorio
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="hours" className="d-flex align-items-center gap-2">
                                        <Clock size={18} /> Horarios
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="security" className="d-flex align-items-center gap-2">
                                        <Lock size={18} /> Seguridad
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Col>
                        <Col sm={9}>
                            <Tab.Content>
                                {/* --- Tab: General --- */}
                                <Tab.Pane eventKey="general">
                                    <Form onSubmit={handleSubmitProfile}>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="first_name"
                                                        value={formData.first_name}
                                                        onChange={handleChange}
                                                    // Removed required to prevent "not focusable" error on hidden tabs
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Apellidos <span className="text-danger">*</span></Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="last_name"
                                                        value={formData.last_name}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label>Teléfono Personal</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        placeholder="Ej. +52 55 1234 5678"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label>Biografía Profesional</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={4}
                                                        name="bio"
                                                        value={formData.bio}
                                                        onChange={handleChange}
                                                        placeholder="Cuéntanos sobre tu experiencia y enfoque..."
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Título / Cédula</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="license_number"
                                                        value={formData.license_number}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group>
                                                    <Form.Label>Años Exp.</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        name="years_of_experience"
                                                        value={formData.years_of_experience}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label>Especialidades (separadas por coma)</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={getSpecialtiesString()}
                                                        onChange={handleSpecialtiesChange}
                                                        placeholder="Ej. Keto, Diabetes, Deportiva"
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label>Certificaciones (separadas por coma)</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={formData.certifications?.join(', ') || ''}
                                                        onChange={handleCertificationsChange}
                                                        placeholder="Ej. ISAK 2, Educador en Diabetes"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <div className="mt-4 text-end">
                                            <Button variant="primary" type="submit" disabled={loading} style={{ background: '#2c7a7b', border: 'none' }}>
                                                {loading ? <Spinner size="sm" animation="border" /> : 'Guardar Perfil'}
                                            </Button>
                                        </div>
                                    </Form>
                                </Tab.Pane>

                                {/* --- Tab: Clinic --- */}
                                <Tab.Pane eventKey="clinic">
                                    <Form onSubmit={handleSubmitProfile}>
                                        <Row className="g-3">
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label>Nombre del Consultorio</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="clinic_name"
                                                        value={formData.clinic_name}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label>Dirección</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="clinic_address"
                                                        value={formData.clinic_address}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Ciudad</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="clinic_city"
                                                        value={formData.clinic_city}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Estado</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="clinic_state"
                                                        value={formData.clinic_state}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Teléfono</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="clinic_phone"
                                                        value={formData.clinic_phone}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Check
                                                    type="switch"
                                                    id="offers-online"
                                                    label="Ofrezco consultas Online"
                                                    name="offers_online"
                                                    checked={formData.offers_online}
                                                    onChange={handleChange}
                                                />
                                                <Form.Check
                                                    type="switch"
                                                    id="offers-in-person"
                                                    label="Ofrezco consultas Presenciales"
                                                    name="offers_in_person"
                                                    checked={formData.offers_in_person}
                                                    onChange={handleChange}
                                                    className="mt-2"
                                                />
                                            </Col>

                                            <Col md={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Costo por Consulta ($)</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        name="consultation_fee"
                                                        value={formData.consultation_fee}
                                                        onChange={handleChange}
                                                        placeholder="0.00"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <div className="mt-4 text-end">
                                            <Button variant="primary" type="submit" disabled={loading} style={{ background: '#2c7a7b', border: 'none' }}>
                                                {loading ? <Spinner size="sm" animation="border" /> : 'Guardar Perfil'}
                                            </Button>
                                        </div>
                                    </Form>
                                </Tab.Pane>

                                {/* --- Tab: Hours --- */}
                                <Tab.Pane eventKey="hours">
                                    <div className="text-center p-4">
                                        <Clock size={48} className="text-muted mb-3" />
                                        <h5>Configuración de Horarios</h5>
                                        <p className="text-muted">
                                            Gestiona tu disponibilidad detallada desde tu Calendario.
                                        </p>
                                        <Button variant="outline-primary" href="/calendar">
                                            Ir al Calendario
                                        </Button>
                                    </div>
                                </Tab.Pane>

                                {/* --- Tab: Security (Password) --- */}
                                <Tab.Pane eventKey="security">
                                    <div className="p-3 border rounded bg-light">
                                        <h6 className="mb-3 d-flex align-items-center text-dark">
                                            <Shield size={18} className="me-2" /> Cambio de Contraseña
                                        </h6>
                                        <Row className="g-3">
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label>Contraseña Actual</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="currentPassword"
                                                        value={passwordData.currentPassword}
                                                        onChange={handlePasswordChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Nueva Contraseña</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="newPassword"
                                                        value={passwordData.newPassword}
                                                        onChange={handlePasswordChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        name="confirmPassword"
                                                        value={passwordData.confirmPassword}
                                                        onChange={handlePasswordChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <div className="mt-3 text-end">
                                            <Button
                                                variant="warning"
                                                onClick={handleSubmitPassword}
                                                disabled={loading || !passwordData.currentPassword}
                                            >
                                                {loading ? <Spinner size="sm" animation="border" /> : 'Actualizar Contraseña'}
                                            </Button>
                                        </div>
                                    </div>
                                </Tab.Pane>

                            </Tab.Content>
                        </Col>
                    </Row>
                </Tab.Container>
            </Modal.Body>
        </Modal>
    );
};

export default EditProfileModal;

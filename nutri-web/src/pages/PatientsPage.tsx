import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePatients } from '../hooks/usePatients';
import type { Patient } from '../services/patientsService';
import patientsService from '../services/patientsService';

// React Icons
import { 
  MdEmail, 
  MdAdd,
  MdArrowBack,
  MdHome,
  MdSearch,
  MdEdit,
  MdDelete,
  MdSave,
  MdClose,
  MdWarning,
  MdCheckCircle,
  MdContentCopy,
  MdLock
} from 'react-icons/md';
import { FaUsers, FaUserCircle, FaStethoscope, FaChartLine } from 'react-icons/fa';
import { BsPersonPlus } from 'react-icons/bs';
import { HiOutlineDocumentText } from 'react-icons/hi';

import { 
  BsGenderMale, 
  BsGenderFemale, 
  BsGenderAmbiguous
} from 'react-icons/bs';

const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { patients, loading, error, createPatient, updatePatient, deletePatient, clearError, refreshPatients } = usePatients();
  
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [temporaryCredentials, setTemporaryCredentials] = useState<any>(null);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para formulario
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    age: '',
    birth_date: '',
    gender: 'male' as 'male' | 'female' | 'other',
  });

  const [formLoading, setFormLoading] = useState(false);

  // Calcular edad automáticamente desde fecha de nacimiento
  const calculateAgeFromBirthDate = (birthDate: string): string => {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (birth > today) return '';
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 0 ? String(age) : '';
  };

  // Manejar cambio de fecha de nacimiento
  const handleBirthDateChange = (birthDate: string) => {
    const calculatedAge = calculateAgeFromBirthDate(birthDate);
    console.log(`📅 Fecha nacimiento: ${birthDate} → Edad calculada: ${calculatedAge}`);
    
    setFormData({
      ...formData,
      birth_date: birthDate,
      age: calculatedAge
    });
  };

  // Verificar email con debounce
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && formData.email.length > 5 && viewMode === 'create') {
        console.log('🔍 Checking email:', formData.email);
        setEmailCheckLoading(true);
        try {
          const exists = await patientsService.checkEmailExists(formData.email);
          console.log('📧 Email check result:', { email: formData.email, exists, type: typeof exists });
          setEmailExists(exists);
          console.log('✅ emailExists state updated to:', exists);
        } catch (error) {
          console.error('❌ Error checking email:', error);
          setEmailExists(false);
        } finally {
          setEmailCheckLoading(false);
        }
      } else {
        console.log('⏭️ Skipping email check:', { 
          email: formData.email, 
          length: formData.email?.length, 
          viewMode 
        });
        setEmailExists(false);
      }
    };

    const timeoutId = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email, viewMode]);

  // Debug useEffect para UI states
  useEffect(() => {
    console.log('🎯 UI State Debug:', {
      email: formData.email,
      emailExists,
      emailCheckLoading,
      viewMode,
      shouldShowError: emailExists,
      shouldShowSuccess: formData.email && !emailExists && !emailCheckLoading && viewMode === 'create'
    });
  }, [formData.email, emailExists, emailCheckLoading, viewMode]);

  // Filtrar pacientes por término de búsqueda y excluir IDs problemáticos
  const filteredPatients = useMemo(() => {
    const problematicIds = [
      '73a9ef86-60fc-4b3a-b8a0-8b87998b86a8',
    ];

    console.log('🔍 Filtrando pacientes:', {
      total: patients.length,
      searchTerm,
      problematicIds
    });

    const filtered = patients.filter(patient => {
      const matchesSearch = !searchTerm || 
        patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isNotProblematic = !problematicIds.includes(patient.id);
      
      if (!isNotProblematic) {
        console.log('⚠️ Excluyendo paciente problemático:', {
          id: patient.id,
          name: `${patient.first_name} ${patient.last_name}`,
          email: patient.email
        });
      }
      
      return matchesSearch && isNotProblematic;
    });

    console.log('✅ Pacientes filtrados:', {
      original: patients.length,
      filtered: filtered.length,
      excluded: patients.length - filtered.length
    });

    return filtered;
  }, [patients, searchTerm]);

  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      age: '',
      birth_date: '',
      gender: 'male',
    });
    setViewMode('create');
    clearError();
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    
    let patientAge = '';
    if (patient.age) {
      patientAge = String(patient.age);
    } else if (patient.birth_date) {
      patientAge = String(new Date().getFullYear() - new Date(patient.birth_date).getFullYear());
    }
    
    console.log('📝 Cargando paciente para editar:', {
      name: `${patient.first_name} ${patient.last_name}`,
      email: patient.email,
      age: patient.age,
      birth_date: patient.birth_date,
      calculated_age: patientAge
    });
    
    setFormData({
      email: patient.email,
      first_name: patient.first_name,
      last_name: patient.last_name,
      phone: patient.phone || '',
      age: patientAge,
      birth_date: patient.birth_date || '',
      gender: patient.gender || 'male',
    });
    setViewMode('edit');
    clearError();
  };

  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const handleViewClinicalRecords = async (patient: Patient) => {
    try {
      console.log('🔍 handleViewClinicalRecords - Recibido:', {
        id: patient.id,
        nombre: `${patient.first_name} ${patient.last_name}`,
        email: patient.email
      });
      const patientExists = await patientsService.getPatientById(patient.id);
      if (patientExists) {
        console.log('✅ Navegando a:', `/patients/${patient.id}/clinical-records`);
        navigate(`/patients/${patient.id}/clinical-records`);
      } else {
        console.error('❌ Paciente no encontrado, no se puede navegar');
        alert('El paciente ya no está disponible. La lista se actualizará.');
        await refreshPatients();
      }
    } catch (error: any) {
      console.error('❌ Error al validar paciente:', error);
      alert('Error al validar paciente.');
    }
  };

  const confirmDelete = async () => {
    if (!selectedPatient) return;

    try {
      const patientIdToDelete = selectedPatient.userId || selectedPatient.id;
      console.log('🗑️ Frontend - Attempting to delete patient:', {
        relationId: selectedPatient.id,
        userId: selectedPatient.userId,
        usingId: patientIdToDelete
      });
      
      await deletePatient(patientIdToDelete);
      setShowDeleteModal(false);
      setSelectedPatient(null);
      await refreshPatients();
    } catch (err) {
      console.error('Error removing patient from list:', err);
    }
  };

  // Función para limpiar y validar los datos del formulario
  const preparePatientData = (data: typeof formData) => {
    const cleanData: any = {};
    
    if (data.first_name?.trim()) {
      cleanData.first_name = data.first_name.trim();
    }
    
    if (data.last_name?.trim()) {
      cleanData.last_name = data.last_name.trim();
    }
    
    if (data.email?.trim()) {
      cleanData.email = data.email.trim().toLowerCase();
    }
    
    if (data.phone?.trim()) {
      cleanData.phone = data.phone.trim();
    }
    
    if (data.gender) {
      cleanData.gender = data.gender;
    }
    
    if (data.birth_date?.trim()) {
      cleanData.birth_date = data.birth_date.trim();
    }
    
    if (data.age && data.age.trim()) {
      const ageNumber = parseInt(data.age.trim());
      if (!isNaN(ageNumber) && ageNumber >= 1 && ageNumber <= 120) {
        cleanData.age = ageNumber;
      }
    }
    
    return cleanData;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (viewMode === 'create') {
        const cleanedData = preparePatientData(formData);
        console.log('🔄 Datos preparados para crear:', cleanedData);
        
        const newPatient = await createPatient(cleanedData) as any;
        
        console.log('🔄 Recargando lista después de crear paciente...');
        await refreshPatients();
        
        if (newPatient.temporaryCredentials) {
          setTemporaryCredentials(newPatient.temporaryCredentials);
          setShowCredentialsModal(true);
        }
      } else if (viewMode === 'edit' && selectedPatient) {
        const cleanedData = preparePatientData(formData);
        console.log('🔄 Datos preparados para actualizar:', cleanedData);
        
        const updatedFields: any = {};
        
        if (cleanedData.first_name && cleanedData.first_name !== selectedPatient.first_name) {
          updatedFields.first_name = cleanedData.first_name;
        }
        
        if (cleanedData.last_name && cleanedData.last_name !== selectedPatient.last_name) {
          updatedFields.last_name = cleanedData.last_name;
        }
        
        if (cleanedData.email && cleanedData.email !== selectedPatient.email) {
          updatedFields.email = cleanedData.email;
        }
        
        if (cleanedData.phone !== selectedPatient.phone) {
          updatedFields.phone = cleanedData.phone || null;
        }
        
        if (cleanedData.gender && cleanedData.gender !== selectedPatient.gender) {
          updatedFields.gender = cleanedData.gender;
        }
        
        if (cleanedData.birth_date && cleanedData.birth_date !== selectedPatient.birth_date) {
          updatedFields.birth_date = cleanedData.birth_date;
        }
        
        if (cleanedData.age !== undefined) {
          updatedFields.age = cleanedData.age;
        }
        
        console.log('🔄 Campos a actualizar:', updatedFields);
        
        if (Object.keys(updatedFields).length > 0) {
          const dataWithEmail = {
            ...updatedFields,
            email: selectedPatient.email
          };
          console.log('📧 Datos finales con email:', dataWithEmail);
          
          await updatePatient(selectedPatient.id, dataWithEmail);
          
          console.log('🔄 Recargando lista de pacientes...');
          await refreshPatients();
        } else {
          console.log('ℹ️ No hay cambios para actualizar');
        }
      }
      setViewMode('list');
      setSelectedPatient(null);
    } catch (err) {
      console.error('❌ Error en handleSubmitForm:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setViewMode('list');
    setSelectedPatient(null);
    clearError();
  };

  if (loading && patients.length === 0) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <h5 className="text-muted">Cargando pacientes...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header Moderno */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid py-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-3 p-3 me-4">
                  <FaUsers className="text-primary" size={32} />
                </div>
                <div>
                  <h1 className="h3 mb-1 fw-bold text-dark">
                    Gestión de Pacientes
                  </h1>
                  <p className="text-muted mb-0">
                    {filteredPatients.length} paciente{filteredPatients.length !== 1 ? 's' : ''} registrado{filteredPatients.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 text-end">
              <div className="d-flex gap-2 justify-content-end flex-wrap">
                {viewMode !== 'list' && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setViewMode('list')}
                  >
                    <MdArrowBack className="me-2" size={18} />
                    Volver
                  </button>
                )}
                
                {viewMode === 'list' && (
                  <button
                    className="btn btn-primary"
                    onClick={handleCreatePatient}
                    disabled={loading}
                  >
                    <BsPersonPlus className="me-2" size={18} />
                    Nuevo Paciente
                  </button>
                )}
                
                <Link to="/dashboard" className="btn btn-outline-secondary">
                  <MdHome className="me-2" size={18} />
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container-fluid py-4">
        {/* Alertas de error */}
        {error && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-danger alert-dismissible fade show shadow-sm rounded-3">
                <div className="d-flex align-items-center">
                  <div className="bg-danger bg-opacity-20 rounded-circle p-2 me-3">
                    <MdWarning className="text-danger" size={20} />
                  </div>
                  <div className="flex-grow-1">
                    <strong>Error:</strong> {error}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={clearError}
                ></button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {viewMode === 'list' ? (
          <div className="row">
            <div className="col-12">
              {/* Barra de búsqueda moderna */}
              <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-body p-4">
                  <div className="row">
                    <div className="col-md-8 col-lg-6">
                      <div className="position-relative">
                        <MdSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={20} />
                        <input
                          type="text"
                          className="form-control form-control-lg ps-5 border-0 bg-light rounded-pill"
                          placeholder="Buscar pacientes por nombre o email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de pacientes */}
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-header bg-white border-0 p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <h5 className="mb-0 d-flex align-items-center fw-bold">
                      <FaStethoscope className="me-2 text-primary" size={22} />
                      Mis Pacientes
                    </h5>
                    <span className="badge bg-primary rounded-pill px-3 py-2">
                      {filteredPatients.length}
                    </span>
                  </div>
                </div>
                <div className="card-body p-4">
                  {filteredPatients.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="bg-light rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" 
                           style={{ width: '100px', height: '100px' }}>
                        <FaUsers className="text-muted" size={48} />
                      </div>
                      <h4 className="text-muted mb-3 fw-bold">
                        {searchTerm ? 'No se encontraron pacientes' : 'Aún no tienes pacientes'}
                      </h4>
                      <p className="text-muted mb-4 lead">
                        {searchTerm 
                          ? 'Intenta con otros términos de búsqueda'
                          : 'Comienza registrando tu primer paciente'
                        }
                      </p>
                      {!searchTerm && (
                        <button className="btn btn-primary btn-lg px-5 py-3 rounded-pill" onClick={handleCreatePatient}>
                          <MdAdd className="me-2" size={20} />
                          Registrar Primer Paciente
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="row g-4">
                      {filteredPatients.map((patient) => (
                        <div key={patient.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                          <div className="card h-100 shadow-sm border-0 rounded-3 patient-card" 
                               style={{ transition: 'all 0.3s ease' }}>
                            <div className="card-body p-4">
                              {/* Header con avatar y status */}
                              <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                                     style={{ width: '60px', height: '60px' }}>
                                  <FaUserCircle className="text-primary" size={32} />
                                </div>
                                <span className={`badge rounded-pill px-3 py-2 ${patient.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                  {patient.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>

                              {/* Información del paciente */}
                              <div className="mb-4 text-center">
                                <h6 className="mb-2 fw-bold text-dark">
                                  {patient.first_name || ''} {patient.last_name || ''}
                                </h6>
                                
                                <p className="text-muted small mb-2 d-flex align-items-center justify-content-center">
                                  <MdEmail className="me-1" size={14} />
                                  {patient.email || 'Sin email'}
                                </p>

                                <p className="text-muted small mb-0 d-flex align-items-center justify-content-center">
                                  {patient.gender === 'male' ? (
                                    <BsGenderMale className="me-1" size={14} />
                                  ) : patient.gender === 'female' ? (
                                    <BsGenderFemale className="me-1" size={14} />
                                  ) : (
                                    <BsGenderAmbiguous className="me-1" size={14} />
                                  )}
                                  {patient.gender === 'male' ? 'Masculino' : 
                                   patient.gender === 'female' ? 'Femenino' : 
                                   patient.gender === 'other' ? 'Otro' : 'No especificado'}
                                </p>
                              </div>

                              {/* Botones de acción modernos */}
                              <div className="d-grid gap-2">
                                <button
                                  className="btn btn-primary rounded-pill"
                                  onClick={() => handleViewClinicalRecords(patient)}
                                  title="Ver expedientes clínicos"
                                >
                                  <HiOutlineDocumentText className="me-2" size={16} />
                                  Expedientes
                                </button>
                                
                                <div className="row g-2">
                                  <div className="col-6">
                                    <button
                                      className="btn btn-outline-primary btn-sm w-100 rounded-pill"
                                      onClick={() => navigate(`/progress?patient=${patient.id}`)}
                                      title="Ver progreso"
                                    >
                                      <FaChartLine className="me-1" size={14} />
                                      Progreso
                                    </button>
                                  </div>
                                  <div className="col-6">
                                    <button
                                      className="btn btn-outline-secondary btn-sm w-100 rounded-pill"
                                      onClick={() => handleEditPatient(patient)}
                                      title="Editar paciente"
                                    >
                                      <MdEdit className="me-1" size={14} />
                                      Editar
                                    </button>
                                  </div>
                                </div>

                                <button
                                  className="btn btn-outline-danger btn-sm rounded-pill"
                                  onClick={() => handleDeletePatient(patient)}
                                  title="Remover paciente de tu lista"
                                >
                                  <MdDelete className="me-2" size={14} />
                                  Remover
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Formulario moderno (crear/editar)
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="card shadow-sm border-0 rounded-3">
                <div className="card-header bg-white border-0 p-4">
                  <h5 className="mb-0 d-flex align-items-center fw-bold">
                    {viewMode === 'create' ? (
                      <MdAdd className="text-primary me-3" size={24} />
                    ) : (
                      <MdEdit className="text-primary me-3" size={24} />
                    )}
                    {viewMode === 'create' ? 'Registrar Nuevo Paciente' : 'Editar Paciente'}
                  </h5>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSubmitForm}>
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-semibold">Nombres *</label>
                          <input
                            type="text"
                            className="form-control form-control-lg rounded-pill"
                            value={formData.first_name}
                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-semibold">Apellidos *</label>
                          <input
                            type="text"
                            className="form-control form-control-lg rounded-pill"
                            value={formData.last_name}
                            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Email *</label>
                      <div className="input-group input-group-lg">
                        <input
                          type="email"
                          className={`form-control rounded-start-pill ${emailExists ? 'is-invalid' : formData.email && !emailExists && viewMode === 'create' ? 'is-valid' : ''}`}
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                        {emailCheckLoading && (
                          <span className="input-group-text rounded-end-pill">
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          </span>
                        )}
                      </div>
                      {emailExists && (
                        <div className="invalid-feedback d-block">
                          <div className="d-flex align-items-center">
                            <MdWarning className="me-2 text-danger" size={16} />
                            Este email ya está registrado. Use un email diferente.
                          </div>
                        </div>
                      )}
                      {formData.email && !emailExists && !emailCheckLoading && viewMode === 'create' && (
                        <div className="valid-feedback d-block">
                          <div className="d-flex align-items-center">
                            <MdCheckCircle className="me-2 text-success" size={16} />
                            Email disponible
                          </div>
                        </div>
                      )}
                    </div>

                    {viewMode === 'create' && (
                      <div className="mb-3">
                        <div className="alert alert-info rounded-3">
                          <div className="d-flex align-items-start">
                            <MdLock className="text-info me-2 mt-1" size={18} />
                            <div>
                              <strong>Nota importante:</strong><br />
                              Se generará automáticamente una contraseña temporal para el paciente. 
                              Las credenciales se mostrarán después del registro.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-semibold">Teléfono</label>
                          <input
                            type="tel"
                            className="form-control form-control-lg rounded-pill"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label fw-semibold">Fecha de Nacimiento</label>
                          <input
                            type="date"
                            className="form-control form-control-lg rounded-pill"
                            value={formData.birth_date}
                            onChange={(e) => handleBirthDateChange(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                          />
                          <div className="form-text">
                            La edad se calculará automáticamente
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.age && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Edad Calculada</label>
                        <input
                          type="text"
                          className="form-control form-control-lg rounded-pill bg-light"
                          value={`${formData.age} años`}
                          readOnly
                        />
                        <div className="form-text text-success">
                          ✓ Calculada automáticamente desde la fecha de nacimiento
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Género</label>
                      <select
                        className="form-select form-select-lg rounded-pill"
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value as 'male' | 'female' | 'other'})}
                      >
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-lg rounded-pill px-4"
                        onClick={handleCancelForm}
                        disabled={formLoading}
                      >
                        <MdClose className="me-2" size={16} />
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg rounded-pill px-4"
                        disabled={formLoading || emailExists || emailCheckLoading}
                      >
                        {formLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            {viewMode === 'create' ? 'Registrando...' : 'Guardando...'}
                          </>
                        ) : (
                          <>
                            {viewMode === 'create' ? (
                              <MdAdd className="me-2" size={16} />
                            ) : (
                              <MdSave className="me-2" size={16} />
                            )}
                            {viewMode === 'create' ? 'Registrar Paciente' : 'Guardar Cambios'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <div className={`modal fade ${showDeleteModal ? 'show' : ''}`} 
           style={{ display: showDeleteModal ? 'block' : 'none' }}
           tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-3 border-0 shadow">
            <div className="modal-header border-0 p-4">
              <h5 className="modal-title d-flex align-items-center fw-bold">
                <MdWarning className="text-warning me-2" size={22} />
                Remover Paciente de tu Lista
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDeleteModal(false)}
              ></button>
            </div>
            <div className="modal-body p-4">
              <p className="mb-3 lead">¿Estás seguro de que deseas remover este paciente de tu lista?</p>
              {selectedPatient && (
                <div className="alert alert-warning rounded-3">
                  <div className="d-flex align-items-center">
                    <FaUserCircle className="text-warning me-3" size={32} />
                    <div>
                      <strong>Paciente:</strong> {selectedPatient.first_name || ''} {selectedPatient.last_name || ''}<br/>
                      <strong>Email:</strong> {selectedPatient.email || 'Sin email'}
                    </div>
                  </div>
                </div>
              )}
              <div className="alert alert-info rounded-3">
                <div className="d-flex align-items-start">
                  <MdWarning className="text-info me-2 mt-1" size={18} />
                  <div>
                    <strong>Nota:</strong> Esto terminará tu relación profesional con este paciente. El paciente mantendrá su cuenta y podrá ser asignado a otro nutriólogo.
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 p-4 d-grid gap-2 d-md-flex justify-content-md-end">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={() => setShowDeleteModal(false)}
              >
                <MdClose className="me-2" size={16} />
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-warning rounded-pill px-4"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Removiendo...
                  </>
                ) : (
                  <>
                    <MdDelete className="me-2" size={16} />
                    Remover de mi Lista
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop del modal */}
      {showDeleteModal && (
        <div className="modal-backdrop fade show"></div>
      )}

      {/* Modal de credenciales temporales */}
      <div className={`modal fade ${showCredentialsModal ? 'show' : ''}`} 
           style={{ display: showCredentialsModal ? 'block' : 'none' }}
           tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-3 border-0 shadow">
            <div className="modal-header border-0 p-4">
              <h5 className="modal-title d-flex align-items-center fw-bold">
                <MdLock className="text-success me-2" size={22} />
                Paciente Registrado Exitosamente
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowCredentialsModal(false)}
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="alert alert-success rounded-3">
                <div className="d-flex align-items-center">
                  <MdCheckCircle className="text-success me-2" size={20} />
                  <div>
                    El paciente ha sido registrado exitosamente. Se han generado credenciales temporales.
                  </div>
                </div>
              </div>
              
              {temporaryCredentials && (
                <div className="card rounded-3">
                  <div className="card-header bg-light border-0 p-3">
                    <h6 className="mb-0 d-flex align-items-center fw-bold">
                      <MdLock className="text-primary me-2" size={18} />
                      Credenciales Temporales
                    </h6>
                  </div>
                  <div className="card-body p-3">
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label className="form-label fw-semibold">Email:</label>
                        <div className="input-group">
                          <input 
                            type="text" 
                            className="form-control rounded-start-pill" 
                            value={temporaryCredentials.email}
                            readOnly
                          />
                          <button 
                            className="btn btn-outline-secondary rounded-end-pill"
                            onClick={() => navigator.clipboard.writeText(temporaryCredentials.email)}
                            title="Copiar email"
                          >
                            <MdContentCopy size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="col-12 mb-3">
                        <label className="form-label fw-semibold">Contraseña Temporal:</label>
                        <div className="input-group">
                          <input 
                            type="text" 
                            className="form-control rounded-start-pill" 
                            value={temporaryCredentials.temporary_password}
                            readOnly
                          />
                          <button 
                            className="btn btn-outline-secondary rounded-end-pill"
                            onClick={() => navigator.clipboard.writeText(temporaryCredentials.temporary_password)}
                            title="Copiar contraseña"
                          >
                            <MdContentCopy size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className="alert alert-warning rounded-3">
                          <div className="d-flex align-items-center">
                            <MdWarning className="text-warning me-2" size={16} />
                            <div>
                              Esta contraseña expira el: {new Date(temporaryCredentials.expires_at).toLocaleString('es-MX')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="alert alert-info mt-3 rounded-3">
                <div className="d-flex align-items-start">
                  <MdWarning className="text-info me-2 mt-1" size={18} />
                  <div>
                    <strong>Importante:</strong><br />
                    Comparte estas credenciales con el paciente de forma segura. 
                    El paciente deberá cambiar su contraseña en el primer inicio de sesión.
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 p-4 d-grid">
              <button
                type="button"
                className="btn btn-primary btn-lg rounded-pill"
                onClick={() => setShowCredentialsModal(false)}
              >
                <MdCheckCircle className="me-2" size={16} />
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop del modal de credenciales */}
      {showCredentialsModal && (
        <div className="modal-backdrop fade show"></div>
      )}
      
      {/* Estilos CSS para hover effects aplicados inline */}
      <style>{`
        .patient-card {
          transition: all 0.3s ease;
        }
        .patient-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        
        .btn {
          transition: transform 0.2s ease;
        }
        .btn:hover {
          transform: translateY(-1px);
        }
        
        .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        
        .bg-light {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
        }
      `}</style>
    </div>
  );
};

export default PatientsPage; 
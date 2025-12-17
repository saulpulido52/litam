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
  MdLock,
  MdRefresh
} from 'react-icons/md';
import { FaUsers, FaUserCircle } from 'react-icons/fa';
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
    birth_date: '', // 🎯 NUEVO: Campo fecha de nacimiento
    gender: 'male' as 'male' | 'female' | 'other',
  });

  const [formLoading, setFormLoading] = useState(false);

  // 🎯 FUNCIÓN: Calcular edad automáticamente desde fecha de nacimiento
  const calculateAgeFromBirthDate = (birthDate: string): string => {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (birth > today) return ''; // Fecha inválida en el futuro
    
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

    const timeoutId = setTimeout(checkEmail, 500); // Debounce de 500ms
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
      // Agregar otros IDs problemáticos aquí si es necesario
    ];

    console.log('🔍 Filtrando pacientes:', {
      total: patients.length,
      searchTerm,
      problematicIds
    });

    // Filtrar por búsqueda y excluir IDs problemáticos
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
      birth_date: '', // 🎯 AGREGAR: Campo fecha de nacimiento
      gender: 'male',
    });
    setViewMode('create');
    clearError();
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    
    // 🎯 SOLUCIÓN: Usar el campo age directo si está disponible, si no calcular desde birth_date
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
      birth_date: patient.birth_date || '', // 🎯 AGREGAR: Campo fecha de nacimiento
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
      // Verificar que el paciente existe antes de navegar
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
      // 🎯 FIX: Usar userId si está disponible, sino usar id como fallback
      const patientIdToDelete = selectedPatient.userId || selectedPatient.id;
      console.log('🗑️ Frontend - Attempting to delete patient:', {
        relationId: selectedPatient.id,
        userId: selectedPatient.userId,
        usingId: patientIdToDelete
      });
      
      await deletePatient(patientIdToDelete);
      setShowDeleteModal(false);
      setSelectedPatient(null);
      await refreshPatients(); // Actualizar la lista después de remover
    } catch (err) {
      console.error('Error removing patient from list:', err);
    }
  };

  // Función para limpiar y validar los datos del formulario
  const preparePatientData = (data: typeof formData) => {
    const cleanData: any = {};
    
    // Campos obligatorios
    if (data.first_name?.trim()) {
      cleanData.first_name = data.first_name.trim();
    }
    
    if (data.last_name?.trim()) {
      cleanData.last_name = data.last_name.trim();
    }
    
    if (data.email?.trim()) {
      cleanData.email = data.email.trim().toLowerCase();
    }
    
    // Campos opcionales
    if (data.phone?.trim()) {
      cleanData.phone = data.phone.trim();
    }
    
    if (data.gender) {
      cleanData.gender = data.gender;
    }
    
    // Fecha de nacimiento
    if (data.birth_date?.trim()) {
      cleanData.birth_date = data.birth_date.trim();
    }
    
    // Edad: convertir a entero y validar rango (opcional, se calculará en el backend)
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
        
        // 🎯 RECARGAR: Actualizar la lista de pacientes después de crear
        console.log('🔄 Recargando lista después de crear paciente...');
        await refreshPatients();
        
        // Si hay credenciales temporales, mostrarlas en el modal
        if (newPatient.temporaryCredentials) {
          setTemporaryCredentials(newPatient.temporaryCredentials);
          setShowCredentialsModal(true);
        }
      } else if (viewMode === 'edit' && selectedPatient) {
        const cleanedData = preparePatientData(formData);
        console.log('🔄 Datos preparados para actualizar:', cleanedData);
        
        // Para editar, solo enviar campos que realmente han cambiado
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
        
        // 🎯 NUEVO: Incluir fecha de nacimiento si ha cambiado
        if (cleanedData.birth_date && cleanedData.birth_date !== selectedPatient.birth_date) {
          updatedFields.birth_date = cleanedData.birth_date;
        }
        
        // Para la edad, no está en la interfaz Patient directamente, así que solo añadir si es diferente de undefined
        if (cleanedData.age !== undefined) {
          updatedFields.age = cleanedData.age;
        }
        
        console.log('🔄 Campos a actualizar:', updatedFields);
        
        // Solo actualizar si hay cambios
        if (Object.keys(updatedFields).length > 0) {
          // 🎯 IMPORTANTE: Siempre incluir el email para usar la nueva funcionalidad robusta
          const dataWithEmail = {
            ...updatedFields,
            email: selectedPatient.email // Incluir email del paciente seleccionado
          };
          console.log('📧 Datos finales con email:', dataWithEmail);
          
          await updatePatient(selectedPatient.id, dataWithEmail);
          
          // 🎯 RECARGAR: Actualizar la lista de pacientes para mostrar cambios
          console.log('🔄 Recargando lista de pacientes...');
          await refreshPatients();
        } else {
          console.log('ℹ️ No hay cambios para actualizar');
        }
      }
      setViewMode('list');
      setSelectedPatient(null);
    } catch (err) {
      // Error se maneja en el hook
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

  // Añadir función para limpiar datos desactualizados
  const handleClearCache = () => {
    console.log('🧹 Limpiando datos desactualizados...');
    
    // Importar y usar las nuevas utilidades
    import('../utils/clearStaleData').then(({ clearStaleData, clearBrowserHistory }) => {
      // Limpiar caché
      clearStaleData();
      
      // Limpiar historial del navegador
      clearBrowserHistory();
      
      // Mostrar mensaje de éxito
      alert('Cache y historial limpiados exitosamente. La página se recargará.');
      
      // Recargar la página después de un breve delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  };

  // Función para forzar redirección a pacientes
  const handleForceRedirect = () => {
    console.log('🔄 Forzando redirección a página de pacientes...');
    
    // Limpiar caché y redirigir
    import('../utils/clearStaleData').then(({ clearStaleData }) => {
      clearStaleData();
      window.location.href = '/patients';
    });
  };

  // Función para resolver problemas de navegación
  const handleFixNavigation = () => {
    console.log('🔧 Resolviendo problemas de navegación...');
    
    import('../utils/clearStaleData').then(({ clearStaleData, validateCurrentUrl }) => {
      // Limpiar caché
      clearStaleData();
      
      // Validar URL actual
      if (!validateCurrentUrl()) {
        console.log('⚠️ URL inválida detectada, redirigiendo...');
        window.location.href = '/patients';
        return;
      }
      
      // Recargar pacientes
      refreshPatients();
      
      alert('Problemas de navegación resueltos. Los datos se han actualizado.');
    });
  };

  if (loading && patients.length === 0) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p>Cargando pacientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mobile-page-content py-4">
      {/* Encabezado */}
      <div className="row mb-4">
        <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div className="mb-2 mb-md-0">
                <h1 className="h3 mb-1 d-flex align-items-center">
                  <FaUsers className="text-primary me-3" size={24} />
                  Gestión de Pacientes
                </h1>
                <p className="text-muted mb-0 small-text-mobile">
                  {patients.length} paciente{patients.length !== 1 ? 's' : ''} registrado{patients.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="btn-group mobile-action-buttons flex-wrap">
                {viewMode !== 'list' && (
                  <button
                    className="btn btn-outline-secondary btn-mobile mb-1"
                    onClick={() => setViewMode('list')}
                  >
                    <MdArrowBack className="me-1" size={18} />
                    <span className="d-none d-sm-inline">Volver a la </span>Lista
                  </button>
                )}
                
                {viewMode === 'list' && (
                  <>
                    <button
                      className="btn btn-outline-warning btn-mobile mb-1 me-2"
                      onClick={handleClearCache}
                      title="Limpiar datos desactualizados y recargar"
                    >
                      <MdRefresh className="me-1" size={16} />
                      <span className="d-none d-sm-inline">Limpiar </span>Cache
                    </button>
                    <button
                      className="btn btn-outline-info btn-mobile mb-1 me-2"
                      onClick={handleFixNavigation}
                      title="Resolver problemas de navegación"
                    >
                      <MdRefresh className="me-1" size={16} />
                      <span className="d-none d-sm-inline">Arreglar </span>Navegación
                    </button>
                    <button
                      className="btn btn-outline-danger btn-mobile mb-1 me-2"
                      onClick={handleForceRedirect}
                      title="Forzar redirección a pacientes"
                    >
                      <MdRefresh className="me-1" size={16} />
                      <span className="d-none d-sm-inline">Forzar </span>Redirección
                    </button>
                    <button
                      className="btn btn-primary btn-mobile mb-1"
                      onClick={handleCreatePatient}
                      disabled={loading}
                    >
                      <BsPersonPlus className="me-1" size={18} />
                      <span className="d-none d-sm-inline">Nuevo </span>Paciente
                    </button>
                  </>
                )}
                
                <Link to="/dashboard" className="btn btn-outline-secondary btn-mobile mb-1">
                  <MdHome className="me-1" size={18} />
                  <span className="d-none d-sm-inline">Dashboard</span>
                </Link>
              </div>
            </div>
        </div>
      </div>

      {/* Alertas de error */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger alert-dismissible fade show mobile-card border-0 shadow-sm">
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
            {/* Búsqueda */}
            <div className="card mb-4 mobile-card border-0 shadow-sm">
              <div className="card-body">
                <div className="row">
                  <div className="col-12">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <MdSearch className="text-muted" size={18} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
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
            <div className="card mobile-card border-0 shadow-sm">
              <div className="card-header bg-light border-0">
                <h5 className="mb-0 text-dark d-flex align-items-center">
                  <HiOutlineDocumentText className="me-2 text-primary" size={22} />
                  Lista de Pacientes
                  <span className="badge bg-primary text-white ms-2">{filteredPatients.length}</span>
                </h5>
              </div>
              <div className="card-body">
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="bg-light rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" 
                         style={{ width: '80px', height: '80px' }}>
                      <FaUsers className="text-muted" size={36} />
                    </div>
                    <h5 className="text-muted mb-3">
                      {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                    </h5>
                    <p className="text-muted small-text-mobile mb-4">
                      {searchTerm 
                        ? 'Intenta con otros términos de búsqueda'
                        : 'Los pacientes aparecerán aquí una vez que se registren'
                      }
                    </p>
                    {!searchTerm && (
                      <button className="btn btn-primary btn-mobile px-4 py-2" onClick={handleCreatePatient}>
                        <MdAdd className="me-2" size={18} />
                        Registrar Primer Paciente
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="row g-3">
                    {filteredPatients.map((patient, idx) => {
                      console.log('📝 Renderizando paciente:', {
                        idx,
                        id: patient.id,
                        nombre: `${patient.first_name} ${patient.last_name}`,
                        email: patient.email
                      });
                      return (
                        <div key={patient.id} className="col-12 col-sm-6 col-lg-4 col-xl-3 patient-card-mobile">
                          <div className="card h-100 shadow-sm">
                            <div className="card-body">
                              {/* Header con avatar y status */}
                              <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                                     style={{ 
                                       width: '50px', 
                                       height: '50px'
                                     }}>
                                  <FaUserCircle className="text-primary" size={24} />
                                </div>
                                <span className={`badge ${patient.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                  {patient.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                              </div>

                              {/* Información del paciente */}
                              <div className="mb-3 text-center">
                                <h6 className="mb-2 patient-name-mobile fw-bold text-dark">
                                  {patient.first_name || ''} {patient.last_name || ''}
                                </h6>
                                
                                <p className="text-muted small mb-2 patient-email-mobile d-flex align-items-center justify-content-center">
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

                              {/* Botones de acción */}
                              <div className="d-grid gap-2">
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => {
                                    console.log('🟢 Botón "Ver Expedientes" clickeado:', {
                                      id: patient.id,
                                      nombre: `${patient.first_name} ${patient.last_name}`,
                                      email: patient.email
                                    });
                                    handleViewClinicalRecords(patient);
                                  }}
                                  title="Ver expedientes clínicos"
                                >
                                  <HiOutlineDocumentText className="me-2" size={14} />
                                  Expedientes
                                </button>
                                
                                <div className="row g-2">
                                  <div className="col-6">
                                    <button
                                      className="btn btn-outline-secondary btn-sm w-100"
                                      onClick={() => handleEditPatient(patient)}
                                      title="Editar paciente"
                                    >
                                      <MdEdit className="me-1" size={16} />
                                      Editar
                                    </button>
                                  </div>
                                  <div className="col-6">
                                    <button
                                      className="btn btn-outline-danger btn-sm w-100"
                                      onClick={() => handleDeletePatient(patient)}
                                      title="Remover paciente de tu lista"
                                    >
                                      <MdDelete className="me-1" size={16} />
                                      Remover
                                    </button>
                                  </div>
                                </div>

                                <button
                                  className="btn btn-outline-info btn-sm"
                                  onClick={() => navigate(`/progress?patient=${patient.id}`)}
                                  title="Ver progreso"
                                >
                                  <HiOutlineDocumentText className="me-2" size={16} />
                                  Progreso
                                </button>
                              </div>
                            </div>
                          </div>
                          {/* Separador visual solo en móviles */}
                          {idx < filteredPatients.length - 1 && (
                            <div className="d-block d-sm-none">
                              <hr className="my-3 mx-auto" style={{ 
                                width: '80%', 
                                border: 'none', 
                                height: '1px', 
                                background: 'linear-gradient(to right, transparent, #dee2e6, transparent)',
                                opacity: 0.5
                              }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Formulario (crear/editar)
        <div className="row">
          <div className="col-12 col-md-8 col-lg-6 mx-auto">
            <div className="card mobile-card border-0 shadow-sm">
              <div className="card-header bg-light border-0">
                <h5 className="mb-0 text-dark d-flex align-items-center">
                  {viewMode === 'create' ? (
                    <MdAdd className="text-primary me-3" size={20} />
                  ) : (
                    <MdEdit className="text-primary me-3" size={20} />
                  )}
                  {viewMode === 'create' ? 'Registrar Nuevo Paciente' : 'Editar Paciente'}
                </h5>
              </div>
              <div className="card-body mobile-form">
                <form onSubmit={handleSubmitForm}>
                  <div className="row">
                    <div className="col-12 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Nombres *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.first_name}
                          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Apellidos *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.last_name}
                          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <div className="input-group">
                      <input
                        type="email"
                        className={`form-control ${emailExists ? 'is-invalid' : formData.email && !emailExists && viewMode === 'create' ? 'is-valid' : ''}`}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                      {emailCheckLoading && (
                        <span className="input-group-text">
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
                      <div className="alert alert-info">
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
                        <label className="form-label">Teléfono</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Fecha de Nacimiento</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.birth_date}
                          onChange={(e) => handleBirthDateChange(e.target.value)}
                          max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
                        />
                        <div className="form-text">
                          La edad se calculará automáticamente
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.age && (
                    <div className="mb-3">
                      <label className="form-label">Edad Calculada</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={`${formData.age} años`}
                        readOnly
                      />
                      <div className="form-text text-success">
                        ✓ Calculada automáticamente desde la fecha de nacimiento
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Género</label>
                    <select
                      className="form-select"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value as 'male' | 'female' | 'other'})}
                    >
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end mobile-action-buttons">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleCancelForm}
                      disabled={formLoading}
                    >
                      <MdClose className="me-2" size={16} />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
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

      {/* Modal de confirmación de eliminación */}
      <div className={`modal fade ${showDeleteModal ? 'show' : ''}`} 
           style={{ display: showDeleteModal ? 'block' : 'none' }}
           tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center">
                <MdWarning className="text-warning me-2" size={22} />
                Remover Paciente de tu Lista
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowDeleteModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-3">¿Estás seguro de que deseas remover este paciente de tu lista?</p>
              {selectedPatient && (
                <div className="alert alert-warning">
                  <div className="d-flex align-items-center">
                    <FaUserCircle className="text-warning me-3" size={24} />
                    <div>
                      <strong>Paciente:</strong> {selectedPatient.first_name || ''} {selectedPatient.last_name || ''}<br/>
                      <strong>Email:</strong> {selectedPatient.email || 'Sin email'}
                    </div>
                  </div>
                </div>
              )}
              <div className="alert alert-info">
                <div className="d-flex align-items-start">
                  <MdWarning className="text-info me-2 mt-1" size={18} />
                  <div className="small-text-mobile">
                    <strong>Nota:</strong> Esto terminará tu relación profesional con este paciente. El paciente mantendrá su cuenta y podrá ser asignado a otro nutriólogo.
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer d-grid gap-2 d-md-flex justify-content-md-end">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                <MdClose className="me-2" size={16} />
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-warning"
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
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title d-flex align-items-center">
                <MdLock className="text-success me-2" size={22} />
                <span className="d-none d-sm-inline">Paciente Registrado Exitosamente</span>
                <span className="d-sm-none">Registro Exitoso</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowCredentialsModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-success">
                <div className="d-flex align-items-center">
                  <MdCheckCircle className="text-success me-2" size={20} />
                  <div>
                    <span className="d-none d-sm-inline">El paciente ha sido registrado exitosamente. Se han generado credenciales temporales.</span>
                    <span className="d-sm-none">Paciente registrado. Credenciales generadas.</span>
                  </div>
                </div>
              </div>
              
              {temporaryCredentials && (
                <div className="card mobile-card">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 text-dark d-flex align-items-center">
                      <MdLock className="text-primary me-2" size={18} />
                      Credenciales Temporales
                    </h6>
                  </div>
                  <div className="card-body mobile-form">
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label className="form-label small-text-mobile">
                          <strong>Email:</strong>
                        </label>
                        <div className="input-group">
                          <input 
                            type="text" 
                            className="form-control" 
                            value={temporaryCredentials.email}
                            readOnly
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => navigator.clipboard.writeText(temporaryCredentials.email)}
                            title="Copiar email"
                          >
                            <MdContentCopy size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="col-12 mb-3">
                        <label className="form-label small-text-mobile">
                          <strong>Contraseña Temporal:</strong>
                        </label>
                        <div className="input-group">
                          <input 
                            type="text" 
                            className="form-control" 
                            value={temporaryCredentials.temporary_password}
                            readOnly
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => navigator.clipboard.writeText(temporaryCredentials.temporary_password)}
                            title="Copiar contraseña"
                          >
                            <MdContentCopy size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="col-12">
                        <div className="alert alert-warning">
                          <div className="d-flex align-items-center small-text-mobile">
                            <MdWarning className="text-warning me-2" size={16} />
                            <div>
                              <span className="d-none d-sm-inline">Esta contraseña expira el: {new Date(temporaryCredentials.expires_at).toLocaleString('es-MX')}</span>
                              <span className="d-sm-none">Expira: {new Date(temporaryCredentials.expires_at).toLocaleDateString('es-MX')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="alert alert-info mt-3">
                <div className="d-flex align-items-start">
                  <MdWarning className="text-info me-2 mt-1" size={18} />
                  <div>
                    <strong>Importante:</strong><br />
                    <span className="d-none d-sm-inline">Comparte estas credenciales con el paciente de forma segura. 
                    El paciente deberá cambiar su contraseña en el primer inicio de sesión.</span>
                    <span className="d-sm-none">Comparte estas credenciales de forma segura.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer d-grid">
              <button
                type="button"
                className="btn btn-primary"
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
    </div>
  );
};

export default PatientsPage; 
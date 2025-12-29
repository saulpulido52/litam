import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { FaPills } from 'react-icons/fa';

interface FormHistoriaClinicaProps {
    formData: any;
    handleInputChange: (section: string, field: string, value: any) => void;
}

const FormHistoriaClinica: React.FC<FormHistoriaClinicaProps> = ({ formData, handleInputChange }) => {
    return (
        <div className="animate-fade-in">
            <h6 className="section-title mb-4">
                <FaPills className="me-2 text-primary" />
                Enfermedades y Medicamentos
            </h6>

            <div className="card-custom mb-4">
                <div className="card-header-custom">
                    <h6 className="mb-0 text-primary fw-bold">Enfermedades Diagnosticadas</h6>
                </div>
                <div className="p-3">
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Check
                                    type="switch"
                                    id="hasDisease"
                                    label="¿Padece alguna enfermedad diagnosticada?"
                                    checked={formData.diagnosedDiseases.hasDisease}
                                    onChange={(e) => handleInputChange('diagnosedDiseases', 'hasDisease', e.target.checked)}
                                    className="custom-switch mb-3"
                                />
                            </Form.Group>
                        </Col>

                        {formData.diagnosedDiseases.hasDisease && (
                            <>
                                <Col md={6}>
                                    <Form.Group className="form-floating-custom">
                                        <Form.Label className="form-label-styled">Nombre de la enfermedad</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="form-control-styled"
                                            value={formData.diagnosedDiseases.diseaseName}
                                            onChange={(e) => handleInputChange('diagnosedDiseases', 'diseaseName', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="form-floating-custom">
                                        <Form.Label className="form-label-styled">¿Desde cuándo?</Form.Label>
                                        <Form.Control
                                            type="text"
                                            className="form-control-styled"
                                            value={formData.diagnosedDiseases.sinceWhen}
                                            onChange={(e) => handleInputChange('diagnosedDiseases', 'sinceWhen', e.target.value)}
                                            placeholder="Ej: Hace 2 años, Desde 2020..."
                                        />
                                    </Form.Group>
                                </Col>
                            </>
                        )}
                    </Row>
                </div>
            </div>

            <div className="card-custom mb-4">
                <div className="card-header-custom">
                    <h6 className="mb-0 text-primary fw-bold">Medicamentos</h6>
                </div>
                <div className="p-3">
                    <Row className="g-3">
                        <Col md={12}>
                            <Form.Group>
                                <Form.Check
                                    type="switch"
                                    id="takesMedication"
                                    label="¿Toma algún medicamento?"
                                    checked={formData.diagnosedDiseases.takesMedication}
                                    onChange={(e) => handleInputChange('diagnosedDiseases', 'takesMedication', e.target.checked)}
                                    className="custom-switch mb-3"
                                />
                            </Form.Group>
                        </Col>

                        {formData.diagnosedDiseases.takesMedication && (
                            <Col md={12}>
                                <Form.Group className="form-floating-custom">
                                    <Form.Label className="form-label-styled">Lista de medicamentos (separados por coma)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        className="form-control-styled"
                                        value={formData.diagnosedDiseases.medicationsList}
                                        onChange={(e) => handleInputChange('diagnosedDiseases', 'medicationsList', e.target.value)}
                                        placeholder="Ej: Paracetamol 500mg, Omeprazol 20mg..."
                                    />
                                </Form.Group>
                            </Col>
                        )}
                    </Row>
                </div>
            </div>

            <div className="card-custom mb-4">
                <div className="card-header-custom">
                    <h6 className="mb-0 text-primary fw-bold">Cirugías y Tratamientos Especiales</h6>
                </div>
                <div className="p-3">
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Check
                                    type="switch"
                                    id="hasSurgery"
                                    label="¿Ha tenido cirugías?"
                                    checked={formData.diagnosedDiseases.hasSurgery}
                                    onChange={(e) => handleInputChange('diagnosedDiseases', 'hasSurgery', e.target.checked)}
                                    className="custom-switch mb-2"
                                />
                            </Form.Group>
                            {formData.diagnosedDiseases.hasSurgery && (
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    className="form-control-styled mt-2"
                                    value={formData.diagnosedDiseases.surgeryDetails}
                                    onChange={(e) => handleInputChange('diagnosedDiseases', 'surgeryDetails', e.target.value)}
                                    placeholder="Detalles de las cirugías..."
                                />
                            )}
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Check
                                    type="switch"
                                    id="takesSpecialTreatment"
                                    label="¿Lleva algún tratamiento especial?"
                                    checked={formData.diagnosedDiseases.takesSpecialTreatment}
                                    onChange={(e) => handleInputChange('diagnosedDiseases', 'takesSpecialTreatment', e.target.checked)}
                                    className="custom-switch mb-2"
                                />
                            </Form.Group>
                            {formData.diagnosedDiseases.takesSpecialTreatment && (
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    className="form-control-styled mt-2"
                                    value={formData.diagnosedDiseases.specialTreatmentDetails}
                                    onChange={(e) => handleInputChange('diagnosedDiseases', 'specialTreatmentDetails', e.target.value)}
                                    placeholder="Detalles del tratamiento..."
                                />
                            )}
                        </Col>
                    </Row>
                </div>
            </div>

            <div className="card-custom">
                <div className="card-header-custom">
                    <h6 className="mb-0 text-primary fw-bold">Antecedentes Familiares</h6>
                </div>
                <div className="p-3">
                    <Row className="g-3">
                        <Col xs={12} sm={6} md={4} >
                            <div className={`checkbox-card ${formData.familyMedicalHistory.obesity ? 'checked' : ''}`}
                                onClick={() => handleInputChange('familyMedicalHistory', 'obesity', !formData.familyMedicalHistory.obesity)}>
                                <Form.Check
                                    type="checkbox"
                                    id="fam_obesity"
                                    checked={formData.familyMedicalHistory.obesity}
                                    onChange={() => { }}
                                    label="Obesidad"
                                    className="custom-checkbox"
                                />
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={4} >
                            <div className={`checkbox-card ${formData.familyMedicalHistory.diabetes ? 'checked' : ''}`}
                                onClick={() => handleInputChange('familyMedicalHistory', 'diabetes', !formData.familyMedicalHistory.diabetes)}>
                                <Form.Check
                                    type="checkbox"
                                    id="fam_diabetes"
                                    checked={formData.familyMedicalHistory.diabetes}
                                    onChange={() => { }}
                                    label="Diabetes"
                                    className="custom-checkbox"
                                />
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={4} >
                            <div className={`checkbox-card ${formData.familyMedicalHistory.hta ? 'checked' : ''}`}
                                onClick={() => handleInputChange('familyMedicalHistory', 'hta', !formData.familyMedicalHistory.hta)}>
                                <Form.Check
                                    type="checkbox"
                                    id="fam_hta"
                                    checked={formData.familyMedicalHistory.hta}
                                    onChange={() => { }}
                                    label="Hipertensión (HTA)"
                                    className="custom-checkbox"
                                />
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={4} >
                            <div className={`checkbox-card ${formData.familyMedicalHistory.cancer ? 'checked' : ''}`}
                                onClick={() => handleInputChange('familyMedicalHistory', 'cancer', !formData.familyMedicalHistory.cancer)}>
                                <Form.Check
                                    type="checkbox"
                                    id="fam_cancer"
                                    checked={formData.familyMedicalHistory.cancer}
                                    onChange={() => { }}
                                    label="Cáncer"
                                    className="custom-checkbox"
                                />
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={4} >
                            <div className={`checkbox-card ${formData.familyMedicalHistory.dyslipidemia ? 'checked' : ''}`}
                                onClick={() => handleInputChange('familyMedicalHistory', 'dyslipidemia', !formData.familyMedicalHistory.dyslipidemia)}>
                                <Form.Check
                                    type="checkbox"
                                    id="fam_dyslipidemia"
                                    checked={formData.familyMedicalHistory.dyslipidemia}
                                    onChange={() => { }}
                                    label="Dislipidemia"
                                    className="custom-checkbox"
                                />
                            </div>
                        </Col>

                        <Col md={12}>
                            <Form.Group className="form-floating-custom mt-2">
                                <Form.Label className="form-label-styled">Otros Antecedentes</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="form-control-styled"
                                    value={formData.familyMedicalHistory.otherHistory || ''}
                                    onChange={(e) => handleInputChange('familyMedicalHistory', 'otherHistory', e.target.value)}
                                    placeholder="Especifique otros antecedentes..."
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
};

export default FormHistoriaClinica;

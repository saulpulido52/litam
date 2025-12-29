import React from 'react';
import NutritionalCardSimple from './NutritionalCardSimple';
import type { DietPlan } from '../../types/diet';

interface DietPlanViewerProps {
  plan: DietPlan;
  onEdit?: () => void;
  onDownload?: () => void;
  onClose?: () => void;
  patients?: any[];
  clinicalRecords?: any[];
}

const DietPlanViewer: React.FC<DietPlanViewerProps> = ({
  plan,
  onEdit,
  onDownload,
  onClose,
  patients = [],
  clinicalRecords = []
}) => {
  return (
    <div style={{ height: '80vh' }}>
      <NutritionalCardSimple
        mode="view"
        dietPlan={plan}
        patient={plan.patient}
        patients={patients}
        clinicalRecords={clinicalRecords}
        onEdit={onEdit}
        onDownload={onDownload}
        onClose={onClose}
      />
    </div>
  );
};

export default DietPlanViewer;
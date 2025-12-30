import React from 'react';
import {
    Calendar,
    Save,
    Copy,
    ShoppingCart,
    Wand2,
    Trash2
} from 'lucide-react';
import { Dropdown } from 'react-bootstrap';

interface MealPlannerToolbarProps {
    selectedWeek: number;
    totalWeeks: number;
    onSelectWeek: (week: number) => void;
    onSave: () => void;
    onClearWeek: () => void;
    onGenerateShoppingList: () => void;
    onApplyTemplate: () => void;
    onCopyWeek: (targetWeek: number) => void;
}

const MealPlannerToolbar: React.FC<MealPlannerToolbarProps> = ({
    selectedWeek,
    totalWeeks,
    onSelectWeek,
    onSave,
    onClearWeek,
    onGenerateShoppingList,
    onApplyTemplate,
    onCopyWeek
}) => {
    return (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 bg-light p-2 rounded-3 mb-3">
            {/* Week Selector */}
            <div className="d-flex align-items-center bg-white rounded-pill shadow-sm p-1">
                {[...Array(totalWeeks)].map((_, i) => {
                    const weekNum = i + 1;
                    const isActive = selectedWeek === weekNum;
                    return (
                        <button
                            key={weekNum}
                            onClick={() => onSelectWeek(weekNum)}
                            className={`btn rounded-pill px-3 py-1 fw-medium transition-all small ${isActive ? 'btn-primary shadow-sm' : 'btn-white text-muted hover-bg-light'}`}
                        >
                            <Calendar size={12} className="me-2 mb-1" />
                            Semana {weekNum}
                        </button>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="d-flex gap-2">
                <Dropdown>
                    <Dropdown.Toggle variant="white" className="btn border-0 shadow-sm rounded-pill text-muted px-3 d-flex align-items-center" id="dropdown-copy">
                        <Copy size={16} className="me-2" />
                        Copiar
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="shadow rounded-4 border-0 p-2">
                        <Dropdown.Header className="small text-uppercase fw-bold text-muted">Copiar esta semana a:</Dropdown.Header>
                        {[...Array(totalWeeks)].map((_, i) => {
                            const weekNum = i + 1;
                            if (weekNum === selectedWeek) return null;
                            return (
                                <Dropdown.Item key={weekNum} onClick={() => onCopyWeek(weekNum)} className="rounded-3">
                                    Semana {weekNum}
                                </Dropdown.Item>
                            );
                        })}
                    </Dropdown.Menu>
                </Dropdown>

                <button onClick={onApplyTemplate} className="btn bg-white border-0 shadow-sm rounded-pill text-purple fw-medium px-3 d-flex align-items-center transition-hover">
                    <Wand2 size={16} className="me-2" />
                    Plantilla
                </button>

                <button onClick={onClearWeek} className="btn bg-white border-0 shadow-sm rounded-pill text-danger fw-medium px-3 d-flex align-items-center transition-hover">
                    <Trash2 size={16} className="me-2" />
                    Limpiar
                </button>

                <button onClick={onSave} className="btn btn-dark shadow-sm rounded-pill px-4 d-flex align-items-center fw-bold transition-hover ms-2">
                    <Save size={16} className="me-2" />
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
};

export default MealPlannerToolbar;

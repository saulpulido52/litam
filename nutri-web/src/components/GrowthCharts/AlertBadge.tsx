import React from 'react';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { type GrowthAlert, getAlertColor, getAlertIcon } from '../../utils/alertDetection';

interface AlertBadgeProps {
    alert: GrowthAlert;
    onClick?: () => void;
}

const AlertBadge: React.FC<AlertBadgeProps> = ({ alert, onClick }) => {
    const color = getAlertColor(alert.severity);
    const icon = getAlertIcon(alert.severity);

    const tooltip = (
        <Tooltip id={`tooltip-${alert.id}`}>
            <div className="text-start">
                <strong>{alert.message}</strong>
                <br />
                <small>
                    Percentil: {alert.percentile.toFixed(1)}
                    <br />
                    Peso: {alert.measurement.weight} kg
                    <br />
                    Edad: {Math.floor(alert.measurement.age / 12)}a {alert.measurement.age % 12}m
                    <br />
                    {new Date(alert.createdAt).toLocaleDateString()}
                </small>
            </div>
        </Tooltip>
    );

    return (
        <OverlayTrigger placement="top" overlay={tooltip}>
            <Badge
                bg={color}
                className={`d-inline-flex align-items-center gap-1 ${onClick ? 'cursor-pointer' : ''}`}
                onClick={onClick}
                style={{ cursor: onClick ? 'pointer' : 'default' }}
            >
                <i className={`bi bi-${icon}`}></i>
                {alert.severity === 'critical' ? 'Crítico' : 'Atención'}
            </Badge>
        </OverlayTrigger>
    );
};

export default AlertBadge;

import React, { useState } from 'react';
import { Settings, Shield, Bell, Palette, RefreshCw, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'appearance' | 'data'>('general');
  const [settings, setSettings] = useState({
    timezone: 'America/Mexico_City',
    language: 'es',
    dateFormat: 'DD/MM/YYYY',
    weekStart: 'monday',
    emailNotifications: true,
    pushNotifications: true,
    reminderTime: '30',
    autoBackup: true,
    backupFrequency: 'weekly',
    theme: 'light',
    sidebarCollapsed: false,
    compactMode: false
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', settings);
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="d-flex align-items-center mb-2">
            <Link to="/dashboard" className="btn btn-outline-secondary me-3 d-md-none">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="h2 mb-1">Configuración</h1>
              <p className="text-muted mb-0">Personaliza tu experiencia en la plataforma</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 text-end d-none d-md-block">
          <Link to="/dashboard" className="btn btn-outline-primary">
            <ArrowLeft size={18} className="me-2" />
            Volver al Dashboard
          </Link>
        </div>
      </div>

      <div className="row">
        {/* Settings Navigation */}
        <div className="col-md-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0">Categorías</h6>
            </div>
            <div className="list-group list-group-flush">
              <button 
                className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                <Settings size={18} className="me-3" />
                General
              </button>
              <button 
                className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell size={18} className="me-3" />
                Notificaciones
              </button>
              <button 
                className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <Shield size={18} className="me-3" />
                Seguridad
              </button>
              <button 
                className={`list-group-item list-group-item-action d-flex align-items-center ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                <Palette size={18} className="me-3" />
                Apariencia
              </button>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="col-md-9">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                {activeTab === 'general' && 'Configuración General'}
                {activeTab === 'notifications' && 'Notificaciones'}
                {activeTab === 'security' && 'Seguridad'}
                {activeTab === 'appearance' && 'Apariencia'}
              </h5>
            </div>
            <div className="card-body">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Zona Horaria</label>
                      <select 
                        className="form-select"
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      >
                        <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                        <option value="America/New_York">Nueva York (GMT-5)</option>
                        <option value="Europe/Madrid">Madrid (GMT+1)</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Idioma</label>
                      <select 
                        className="form-select"
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <div className="mb-4">
                    <h6 className="mb-3">Tipos de Notificaciones</h6>
                    <div className="form-check mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="emailNotifications">
                        Notificaciones por correo electrónico
                      </label>
                    </div>
                    <div className="form-check mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="pushNotifications"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="pushNotifications">
                        Notificaciones push del navegador
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div>
                  <div className="alert alert-info">
                    <strong>Configuración de seguridad</strong><br />
                    Estas opciones te ayudan a mantener tu cuenta segura.
                  </div>
                  <div className="d-grid gap-2">
                    <button className="btn btn-outline-primary">
                      <RefreshCw size={16} className="me-2" />
                      Cambiar Contraseña
                    </button>
                    <button className="btn btn-outline-warning">
                      <Shield size={16} className="me-2" />
                      Configurar 2FA
                    </button>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div>
                  <div className="mb-4">
                    <h6 className="mb-3">Tema</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="theme" 
                            id="lightTheme"
                            value="light"
                            checked={settings.theme === 'light'}
                            onChange={(e) => handleSettingChange('theme', e.target.value)}
                          />
                          <label className="form-check-label" htmlFor="lightTheme">
                            Tema Claro
                          </label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            name="theme" 
                            id="darkTheme"
                            value="dark"
                            checked={settings.theme === 'dark'}
                            onChange={(e) => handleSettingChange('theme', e.target.value)}
                          />
                          <label className="form-check-label" htmlFor="darkTheme">
                            Tema Oscuro
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                <button className="btn btn-primary" onClick={handleSaveSettings}>
                  <Save size={16} className="me-2" />
                  Guardar Configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 
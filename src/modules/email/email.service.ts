// src/services/email.service.ts
import nodemailer from 'nodemailer';
import { AppError } from '../../utils/app.error';

export interface EmailCredentials {
    email: string;
    temporary_password: string;
    expires_at: Date;
    patient_name: string;
    nutritionist_name: string;
}

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.configureTransporter();
    }

    private configureTransporter() {
        // Configuración para Hostinger SMTP
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.hostinger.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // false para puerto 587, true para 465
            auth: {
                user: process.env.SMTP_USER || 'litam@wexdoc.com',
                pass: process.env.SMTP_PASSWORD || 'S0p0rt3obr.'
            },
            tls: {
                rejectUnauthorized: false // Para evitar problemas con certificados
            }
        });
    }

    /**
     * Envía credenciales de acceso por email al nuevo paciente
     */
    async sendPatientCredentials(credentials: EmailCredentials): Promise<void> {
        try {
            const emailTemplate = this.generateCredentialsEmailTemplate(credentials);

            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Litam Sistema',
                    address: process.env.EMAIL_FROM || 'litam@wexdoc.com'
                },
                to: credentials.email,
                subject: '🔑 Credenciales de acceso - Litam',
                html: emailTemplate
            };

            console.log(`📧 Enviando credenciales a: ${credentials.email}`);
            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email enviado exitosamente. Message ID: ${result.messageId}`);

        } catch (error) {
            console.error('❌ Error enviando email:', error);
            throw new AppError('Error al enviar las credenciales por email', 500);
        }
    }

    /**
     * Genera el template HTML para el email de credenciales
     */
    private generateCredentialsEmailTemplate(credentials: EmailCredentials): string {
        const expirationDate = credentials.expires_at.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Credenciales de Acceso - Litam</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f8f9fa;
                    margin: 0;
                    padding: 0;
                    line-height: 1.6;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 300;
                }
                .content {
                    padding: 40px 30px;
                }
                .welcome {
                    background-color: #e8f5e8;
                    border-left: 4px solid #28a745;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 0 8px 8px 0;
                }
                .credentials-box {
                    background-color: #f8f9fa;
                    border: 2px solid #dee2e6;
                    border-radius: 8px;
                    padding: 25px;
                    margin: 25px 0;
                    text-align: center;
                }
                .credential-item {
                    margin: 15px 0;
                    padding: 15px;
                    background-color: #ffffff;
                    border-radius: 6px;
                    border: 1px solid #e9ecef;
                }
                .credential-label {
                    font-weight: 600;
                    color: #495057;
                    display: block;
                    margin-bottom: 5px;
                }
                .credential-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: #28a745;
                    font-family: 'Courier New', monospace;
                    background-color: #f8f9fa;
                    padding: 8px 12px;
                    border-radius: 4px;
                    border: 1px solid #dee2e6;
                    display: inline-block;
                }
                .warning {
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 25px 0;
                    color: #856404;
                }
                .warning-icon {
                    font-size: 20px;
                    margin-right: 10px;
                }
                .steps {
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    padding: 25px;
                    margin: 25px 0;
                }
                .step {
                    display: flex;
                    align-items: flex-start;
                    margin: 15px 0;
                }
                .step-number {
                    background-color: #28a745;
                    color: white;
                    border-radius: 50%;
                    width: 25px;
                    height: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    margin-right: 15px;
                    flex-shrink: 0;
                }
                .step-text {
                    margin-top: 2px;
                }
                .footer {
                    background-color: #f8f9fa;
                    padding: 25px 30px;
                    text-align: center;
                    color: #6c757d;
                    font-size: 14px;
                    border-top: 1px solid #dee2e6;
                }
                .button {
                    display: inline-block;
                    background-color: #28a745;
                    color: white;
                    text-decoration: none;
                    padding: 12px 25px;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                }
                .button:hover {
                    background-color: #218838;
                }
                @media (max-width: 600px) {
                    .container {
                        margin: 10px;
                    }
                    .content, .header, .footer {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌟 ¡Bienvenido a Litam!</h1>
                    <p>Tu plataforma de nutrición personalizada</p>
                </div>
                
                <div class="content">
                    <div class="welcome">
                        <h3>¡Hola ${credentials.patient_name}!</h3>
                        <p><strong>${credentials.nutritionist_name}</strong> te ha registrado en Litam para brindarte el mejor seguimiento nutricional personalizado.</p>
                    </div>

                    <h3>🔑 Tus credenciales de acceso</h3>
                    <div class="credentials-box">
                        <div class="credential-item">
                            <span class="credential-label">📧 Email de acceso:</span>
                            <div class="credential-value">${credentials.email}</div>
                        </div>
                        <div class="credential-item">
                            <span class="credential-label">🔒 Contraseña temporal:</span>
                            <div class="credential-value">${credentials.temporary_password}</div>
                        </div>
                    </div>

                    <div class="warning">
                        <span class="warning-icon">⚠️</span>
                        <strong>Importante:</strong> Esta contraseña es temporal y expira el <strong>${expirationDate}</strong>. 
                        Debes cambiarla en tu primer inicio de sesión por tu seguridad.
                    </div>

                    <h3>📋 ¿Cómo acceder a tu cuenta?</h3>
                    <div class="steps">
                        <div class="step">
                            <div class="step-number">1</div>
                            <div class="step-text">
                                <strong>Accede a la plataforma</strong><br>
                                Visita <a href="${process.env.FRONTEND_URL || 'https://litam.com'}">${process.env.FRONTEND_URL || 'https://litam.com'}</a>
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">2</div>
                            <div class="step-text">
                                <strong>Inicia sesión</strong><br>
                                Usa tu email y la contraseña temporal proporcionada arriba
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">3</div>
                            <div class="step-text">
                                <strong>Crea tu nueva contraseña</strong><br>
                                El sistema te pedirá que cambies tu contraseña temporal
                            </div>
                        </div>
                        <div class="step">
                            <div class="step-number">4</div>
                            <div class="step-text">
                                <strong>¡Comienza tu viaje nutricional!</strong><br>
                                Explora tu perfil, revisa tus planes y mantente en contacto con tu nutriólogo
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'https://litam.com'}" class="button">
                            🚀 Acceder a mi cuenta
                        </a>
                    </div>

                    <p><strong>¿Necesitas ayuda?</strong><br>
                    Si tienes problemas para acceder, contacta directamente con <strong>${credentials.nutritionist_name}</strong> 
                    o envía un email a <a href="mailto:${process.env.EMAIL_FROM || 'litam@wexdoc.com'}">${process.env.EMAIL_FROM || 'litam@wexdoc.com'}</a></p>
                </div>

                <div class="footer">
                    <p><strong>Litam - Tu salud nutricional en buenas manos</strong></p>
                    <p>Este email fue enviado automáticamente. Por favor no respondas a este mensaje.</p>
                    <p>© ${new Date().getFullYear()} Litam. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Verifica la configuración de email
     */
    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('✅ Conexión SMTP verificada exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error en la conexión SMTP:', error);
            return false;
        }
    }

    /**
     * Envía un email de prueba
     */
    async sendTestEmail(toEmail: string): Promise<void> {
        try {
            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Litam Sistema',
                    address: process.env.EMAIL_FROM || 'litam@wexdoc.com'
                },
                to: toEmail,
                subject: '✅ Email de prueba - Litam',
                html: `
                    <h2>¡Conexión SMTP exitosa!</h2>
                    <p>Este es un email de prueba para verificar que la configuración SMTP está funcionando correctamente.</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
                    <p><strong>Configuración:</strong> Hostinger SMTP</p>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email de prueba enviado. Message ID: ${result.messageId}`);
        } catch (error) {
            console.error('❌ Error enviando email de prueba:', error);
            throw new AppError('Error al enviar email de prueba', 500);
        }
    }
}

// Exportar una instancia singleton
export const emailService = new EmailService();
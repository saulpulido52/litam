import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { DietPlan } from '../../database/entities/diet_plan.entity';
import { AppError } from '../../utils/app.error';

interface PdfGenerationResult {
    pdfPath: string;
    filename: string;
}

// Interfaz para la definición de la tabla, ahora más flexible
interface TableDefinition {
    headers: string[];
    rows: string[][];
    widths?: string[]; // Anchos de columna como porcentajes (e.g., '50%')
}

export class PdfGenerationService {
    private readonly PDF_DIR = path.join(process.cwd(), 'generated-pdfs');
    private readonly BRAND_COLOR = '#1e3a8a';
    private readonly TEXT_COLOR = '#374151';
    private readonly LIGHT_TEXT_COLOR = '#6b7280';

    constructor() {
        if (!fs.existsSync(this.PDF_DIR)) {
            fs.mkdirSync(this.PDF_DIR, { recursive: true });
        }
    }

    public async generate(dietPlan: DietPlan): Promise<PdfGenerationResult> {
        const filename = `plan-nutricional-${dietPlan.id}-${Date.now()}.pdf`;
        const pdfPath = path.join(this.PDF_DIR, filename);

        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 40, bottom: 40, left: 50, right: 50 }, // Márgenes estándar
            bufferPages: true, // Necesario para el cálculo del pie de página
            info: {
                Title: `Plan Nutricional - ${dietPlan.name}`,
                Author: `NutriWeb - Dr./Dra. ${dietPlan.nutritionist.first_name}`,
                Creator: 'NutriWeb Platform'
            }
        });

        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        // --- Contenido del PDF ---
        this._addHeader(doc, dietPlan);
        this._addPatientAndPlanInfo(doc, dietPlan);
        this._addWeeklyMealsTable(doc, dietPlan);
        
        // El pie de página se añade al final, después de que todas las páginas han sido renderizadas
        this._addFooter(doc);

        doc.end();

        return new Promise((resolve, reject) => {
            stream.on('finish', () => resolve({ pdfPath, filename }));
            stream.on('error', (err) => reject(new AppError(`Error al escribir el archivo PDF: ${err.message}`, 500)));
        });
    }

    private _addHeader(doc: PDFKit.PDFDocument, dietPlan: DietPlan): void {
        doc.fontSize(20).font('Helvetica-Bold').fillColor(this.BRAND_COLOR)
           .text('Plan Nutricional Personalizado', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').fillColor(this.TEXT_COLOR)
           .text(`Preparado por: Dr./Dra. ${dietPlan.nutritionist.first_name} ${dietPlan.nutritionist.last_name}`, { align: 'center' });
        doc.moveDown(1.5);
    }

    private _addPatientAndPlanInfo(doc: PDFKit.PDFDocument, dietPlan: DietPlan): void {
        this._addSectionTitle(doc, 'Información del Paciente y Plan');
        const info = {
            'Paciente': `${dietPlan.patient.first_name} ${dietPlan.patient.last_name}`,
            'Periodo del Plan': `${new Date(dietPlan.start_date).toLocaleDateString()} - ${new Date(dietPlan.end_date).toLocaleDateString()}`,
            'Calorías Diarias (Promedio)': `${dietPlan.daily_calories_target || 'N/A'} kcal`,
            'Objetivo Principal': dietPlan.description || 'No especificado'
        };
        this._addKeyValuePairs(doc, info);
    }

    private _addWeeklyMealsTable(doc: PDFKit.PDFDocument, dietPlan: DietPlan): void {
        this._addSectionTitle(doc, 'Planificación Semanal de Comidas');
        if (!dietPlan.weekly_plans || dietPlan.weekly_plans.length === 0) {
            doc.fontSize(10).font('Helvetica').text('No hay una planificación semanal detallada en este plan.', { indent: 10 });
            return;
        }

        dietPlan.weekly_plans.forEach((week: any) => {
            if (!week.meals || week.meals.length === 0) return;

            doc.fontSize(12).font('Helvetica-Bold').text(`Semana ${week.week_number || week.weekNumber}`, { underline: true });
            doc.moveDown(0.5);

            // Definición de la tabla con anchos porcentuales para mayor responsividad
            const table: TableDefinition = {
                headers: ['Día', 'Tipo', 'Hora', 'Descripción', 'Cal.', 'P', 'C', 'G', 'Notas'],
                widths: ['8%', '10%', '8%', '26%', '8%', '6%', '6%', '6%', '22%'],
                rows: week.meals.map((meal: any) => [
                    this._capitalize(meal.day),
                    this._getMealTypeLabel(meal.meal_type),
                    meal.time || '-',
                    meal.meal_description || '-',
                    meal.total_calories ? `${meal.total_calories}` : '-',
                    meal.total_protein ? `${meal.total_protein}` : '-',
                    meal.total_carbs ? `${meal.total_carbs}` : '-',
                    meal.total_fats ? `${meal.total_fats}` : '-',
                    meal.notes || '-'
                ])
            };

            this._createTable(doc, table);
            doc.moveDown(1);
        });
    }

    private _addFooter(doc: PDFKit.PDFDocument): void {
        const range = doc.bufferedPageRange(); // Obtiene el rango de páginas
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            // Añade el número de página en la parte inferior
            doc.fontSize(8).fillColor(this.LIGHT_TEXT_COLOR)
               .text(`Página ${i + 1} de ${range.count}`, 
               doc.page.margins.left, 
               doc.page.height - doc.page.margins.bottom + 10, 
               { align: 'center' }
            );
        }
    }

    private _addSectionTitle(doc: PDFKit.PDFDocument, title: string): void {
        doc.fontSize(14).font('Helvetica-Bold').fillColor(this.BRAND_COLOR)
           .text(title);
        doc.strokeColor(this.BRAND_COLOR).lineWidth(0.5)
           .moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
        doc.moveDown(1);
    }

    private _addKeyValuePairs(doc: PDFKit.PDFDocument, data: Record<string, string>): void {
        doc.fontSize(10);
        for (const [key, value] of Object.entries(data)) {
            doc.font('Helvetica-Bold').text(`${key}: `, { continued: true })
               .font('Helvetica').text(value);
        }
        doc.moveDown(1);
    }

    private _createTable(doc: PDFKit.PDFDocument, table: TableDefinition): void {
        if (!table.rows || table.rows.length === 0) return;

        const tableTop = doc.y;
        const startX = doc.page.margins.left;
        const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

        // Calcula los anchos de columna en puntos, ya sea desde porcentajes o distribuyendo equitativamente
        const columnWidths = table.widths
            ? table.widths.map(w => parseFloat(w) / 100 * availableWidth)
            : Array(table.headers.length).fill(availableWidth / table.headers.length);

        // Dibuja los encabezados
        doc.font('Helvetica-Bold').fontSize(9);
        let currentX = startX;
        table.headers.forEach((header, i) => {
            doc.text(header, currentX, tableTop, { width: columnWidths[i], align: 'left' });
            currentX += columnWidths[i];
        });

        let y = tableTop + 20;
        doc.font('Helvetica').fontSize(8);

        // Dibuja las filas
        table.rows.forEach(row => {
            // Calcula la altura máxima de la fila para manejar el ajuste de texto
            const rowHeight = Math.max(...row.map((cell, i) => 
                doc.heightOfString(cell, { width: columnWidths[i] })
            ));

            // Salto de página si la fila no cabe
            if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                y = doc.page.margins.top;
                // Redibuja los encabezados en la nueva página
                doc.font('Helvetica-Bold').fontSize(9);
                currentX = startX;
                table.headers.forEach((header, i) => {
                    doc.text(header, currentX, y, { width: columnWidths[i] });
                    currentX += columnWidths[i];
                });
                y += 20;
                doc.font('Helvetica').fontSize(8);
            }

            // Dibuja las celdas de la fila
            currentX = startX;
            row.forEach((cell, i) => {
                doc.text(cell, currentX, y, { width: columnWidths[i], align: 'left' });
                currentX += columnWidths[i];
            });
            
            // Línea divisoria debajo de la fila
            y += rowHeight + 4;
            doc.moveTo(startX, y).lineTo(startX + availableWidth, y).lineWidth(0.5).strokeColor('#e0e0e0').stroke();
            y += 4;
        });

        doc.y = y;
    }

    private _getMealTypeLabel(type: string) {
        return ({ breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena', snack: 'Colación' }[type] || this._capitalize(type));
    }

    private _capitalize(s: string) { 
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; 
    }
}
